"""
Voice Activity Detector — Standalone Web Application
Uses silero-vad to detect speech in audio and split into small clips.
"""

import os
import io
import json
import zipfile
import tempfile
import uuid
from pathlib import Path

import torch
import torchaudio
import numpy as np
import soundfile as sf
from flask import Flask, render_template, request, jsonify, send_file
from silero_vad import load_silero_vad, get_speech_timestamps, read_audio

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max upload
app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp(prefix='vad_')

# Load silero-vad model once at startup
print("Loading silero-vad model...")
vad_model = load_silero_vad()
print("Model loaded successfully!")

ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'opus', 'webm'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def load_and_resample(file_path, target_sr=16000):
    """Load audio file and resample to target sample rate (16kHz for silero-vad)."""
    try:
        waveform, sr = torchaudio.load(file_path)
    except Exception:
        # Fallback to soundfile
        data, sr = sf.read(file_path, dtype='float32')
        if data.ndim > 1:
            data = data.mean(axis=1)
        waveform = torch.from_numpy(data).unsqueeze(0)
    
    # Convert to mono if stereo
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)
    
    # Resample if needed
    if sr != target_sr:
        resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=target_sr)
        waveform = resampler(waveform)
    
    return waveform.squeeze(0), target_sr


def merge_close_segments(timestamps, sr, min_gap_ms=300):
    """Merge segments that are too close together."""
    if not timestamps:
        return []
    
    merged = [timestamps[0].copy()]
    min_gap_samples = int(min_gap_ms * sr / 1000)
    
    for seg in timestamps[1:]:
        if seg['start'] - merged[-1]['end'] < min_gap_samples:
            merged[-1]['end'] = seg['end']
        else:
            merged.append(seg.copy())
    
    return merged


def split_long_segments(timestamps, sr, max_duration_s=10.0):
    """Split segments longer than max_duration into smaller pieces."""
    result = []
    max_samples = int(max_duration_s * sr)
    
    for seg in timestamps:
        duration = seg['end'] - seg['start']
        if duration <= max_samples:
            result.append(seg)
        else:
            # Split into roughly equal parts
            n_parts = int(np.ceil(duration / max_samples))
            part_len = duration // n_parts
            for i in range(n_parts):
                start = seg['start'] + i * part_len
                end = min(seg['start'] + (i + 1) * part_len, seg['end'])
                result.append({'start': int(start), 'end': int(end)})
    
    return result


def pad_segments(timestamps, sr, total_samples, pad_ms=200):
    """Add padding around each segment."""
    pad_samples = int(pad_ms * sr / 1000)
    padded = []
    
    for seg in timestamps:
        padded.append({
            'start': max(0, seg['start'] - pad_samples),
            'end': min(total_samples, seg['end'] + pad_samples)
        })
    
    return padded


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze audio file and return speech timestamps."""
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    file = request.files['audio']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': f'Invalid file. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400
    
    # Save uploaded file
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    file_path = os.path.join(session_dir, file.filename)
    file.save(file_path)
    
    try:
        # Load and resample
        waveform, sr = load_and_resample(file_path)
        total_duration = len(waveform) / sr
        
        # Get VAD parameters from request
        min_speech_ms = int(request.form.get('min_speech_ms', 250))
        min_silence_ms = int(request.form.get('min_silence_ms', 300))
        threshold = float(request.form.get('threshold', 0.5))
        max_segment_s = float(request.form.get('max_segment_s', 10.0))
        padding_ms = int(request.form.get('padding_ms', 200))
        
        # Run VAD
        speech_timestamps = get_speech_timestamps(
            waveform,
            vad_model,
            sampling_rate=sr,
            threshold=threshold,
            min_speech_duration_ms=min_speech_ms,
            min_silence_duration_ms=min_silence_ms,
        )
        
        # Post-process: merge close, split long, add padding
        processed = merge_close_segments(speech_timestamps, sr, min_gap_ms=min_silence_ms)
        processed = split_long_segments(processed, sr, max_duration_s=max_segment_s)
        processed = pad_segments(processed, sr, len(waveform), pad_ms=padding_ms)
        
        # Build response
        segments = []
        for i, seg in enumerate(processed):
            start_s = seg['start'] / sr
            end_s = seg['end'] / sr
            segments.append({
                'id': i + 1,
                'start': round(start_s, 3),
                'end': round(end_s, 3),
                'duration': round(end_s - start_s, 3),
            })
        
        return jsonify({
            'session_id': session_id,
            'filename': file.filename,
            'total_duration': round(total_duration, 3),
            'sample_rate': sr,
            'segments': segments,
            'segment_count': len(segments),
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/process', methods=['POST'])
def process():
    """Process audio and return ZIP of speech segments."""
    data = request.get_json()
    if not data or 'session_id' not in data:
        return jsonify({'error': 'Missing session_id'}), 400
    
    session_id = data['session_id']
    session_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
    
    if not os.path.exists(session_dir):
        return jsonify({'error': 'Session expired. Please re-upload.'}), 404
    
    # Find the audio file
    audio_files = [f for f in os.listdir(session_dir) if not f.endswith('.zip')]
    if not audio_files:
        return jsonify({'error': 'Audio file not found'}), 404
    
    file_path = os.path.join(session_dir, audio_files[0])
    segments = data.get('segments', [])
    output_format = data.get('format', 'wav')
    
    try:
        waveform, sr = load_and_resample(file_path)
        
        # Create ZIP in memory
        zip_buffer = io.BytesIO()
        base_name = Path(audio_files[0]).stem
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            for seg in segments:
                start_sample = int(seg['start'] * sr)
                end_sample = int(seg['end'] * sr)
                segment_audio = waveform[start_sample:end_sample].numpy()
                
                # Write segment to buffer
                seg_buffer = io.BytesIO()
                sf.write(seg_buffer, segment_audio, sr, format='WAV')
                seg_buffer.seek(0)
                
                filename = f"{base_name}_segment_{seg['id']:03d}_{seg['start']:.1f}s-{seg['end']:.1f}s.wav"
                zf.writestr(filename, seg_buffer.read())
        
        zip_buffer.seek(0)
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name=f'{base_name}_segments.zip'
        )
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("  Voice Activity Detector")
    print("  Open: http://localhost:5000")
    print("=" * 50 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
