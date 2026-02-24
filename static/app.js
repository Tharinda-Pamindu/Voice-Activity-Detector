/**
 * Voice Activity Detector — Frontend Application
 * Handles file upload, VAD analysis, timeline visualization, and segment export.
 */

(function () {
    'use strict';

    // ── DOM Elements ──
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const removeFileBtn = document.getElementById('remove-file');

    const settingsSection = document.getElementById('settings-section');
    const toggleSettingsBtn = document.getElementById('toggle-settings');
    const settingsBody = document.getElementById('settings-body');

    const thresholdSlider = document.getElementById('threshold');
    const minSpeechSlider = document.getElementById('min-speech');
    const minSilenceSlider = document.getElementById('min-silence');
    const maxSegmentSlider = document.getElementById('max-segment');
    const paddingSlider = document.getElementById('padding');

    const analyzeBtn = document.getElementById('analyze-btn');
    const progressSection = document.getElementById('progress-section');
    const progressTitle = document.getElementById('progress-title');
    const progressSubtitle = document.getElementById('progress-subtitle');

    const resultsSection = document.getElementById('results-section');
    const resultsSummary = document.getElementById('results-summary');
    const segmentsList = document.getElementById('segments-list');
    const downloadBtn = document.getElementById('download-btn');
    const restartBtn = document.getElementById('restart-btn');
    const selectAllBtn = document.getElementById('select-all-btn');

    const timelineCanvas = document.getElementById('timeline-canvas');
    const timelineStart = document.getElementById('timeline-start');
    const timelineEnd = document.getElementById('timeline-end');

    const snackbar = document.getElementById('snackbar');
    const snackbarIcon = snackbar.querySelector('.snackbar-icon');
    const snackbarMessage = document.getElementById('snackbar-message');

    // ── State ──
    let currentFile = null;
    let analysisResult = null;
    let selectedSegments = new Set();
    let snackbarTimeout = null;

    // ── Initialization ──
    init();

    function init() {
        setupDropZone();
        setupSliders();
        setupButtons();
    }

    // ── Drop Zone ──
    function setupDropZone() {
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) handleFile(files[0]);
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleFile(e.target.files[0]);
        });

        removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetUpload();
        });
    }

    function handleFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        const allowed = ['wav', 'mp3', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'opus', 'webm'];
        if (!allowed.includes(ext)) {
            showSnackbar('Unsupported format. Use WAV, MP3, OGG, FLAC, M4A, or OPUS.', 'error');
            return;
        }

        currentFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);

        dropZone.classList.add('hidden');
        fileInfo.classList.remove('hidden');
        settingsSection.classList.remove('hidden');
        settingsSection.style.animation = 'slideUp 0.4s ease both';
        analyzeBtn.disabled = false;

        showSnackbar(`"${file.name}" loaded successfully`, 'success');
    }

    function resetUpload() {
        currentFile = null;
        analysisResult = null;
        selectedSegments.clear();
        fileInput.value = '';

        dropZone.classList.remove('hidden');
        fileInfo.classList.add('hidden');
        settingsSection.classList.add('hidden');
        progressSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        analyzeBtn.disabled = true;
    }

    // ── Sliders ──
    function setupSliders() {
        const updateSlider = (slider, display, formatter) => {
            const update = () => { display.textContent = formatter(slider.value); };
            slider.addEventListener('input', update);
            update();
        };

        updateSlider(thresholdSlider, document.getElementById('threshold-val'),
            v => parseFloat(v).toFixed(2));
        updateSlider(minSpeechSlider, document.getElementById('min-speech-val'),
            v => `${v}ms`);
        updateSlider(minSilenceSlider, document.getElementById('min-silence-val'),
            v => `${v}ms`);
        updateSlider(maxSegmentSlider, document.getElementById('max-segment-val'),
            v => `${v}s`);
        updateSlider(paddingSlider, document.getElementById('padding-val'),
            v => `${v}ms`);
    }

    // ── Buttons ──
    function setupButtons() {
        analyzeBtn.addEventListener('click', handleAnalyze);
        downloadBtn.addEventListener('click', handleDownload);
        restartBtn.addEventListener('click', resetUpload);
        selectAllBtn.addEventListener('click', toggleSelectAll);

        toggleSettingsBtn.addEventListener('click', () => {
            settingsBody.classList.toggle('collapsed');
            const icon = toggleSettingsBtn.querySelector('.material-icons-round');
            icon.textContent = settingsBody.classList.contains('collapsed') ? 'expand_more' : 'expand_less';
        });

        // Ripple effect
        document.querySelectorAll('.primary-btn, .outline-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.3);
                    pointer-events: none;
                    animation: rippleAnim 0.6s ease-out forwards;
                `;
                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height) * 2;
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add ripple keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rippleAnim {
                from { transform: scale(0); opacity: 1; }
                to { transform: scale(1); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // ── Analyze ──
    async function handleAnalyze() {
        if (!currentFile) return;

        // Show progress
        progressSection.classList.remove('hidden');
        progressSection.style.animation = 'slideUp 0.3s ease both';
        resultsSection.classList.add('hidden');
        analyzeBtn.disabled = true;
        progressTitle.textContent = 'Analyzing audio...';
        progressSubtitle.textContent = 'Running Voice Activity Detection with Silero VAD';

        const formData = new FormData();
        formData.append('audio', currentFile);
        formData.append('threshold', thresholdSlider.value);
        formData.append('min_speech_ms', minSpeechSlider.value);
        formData.append('min_silence_ms', minSilenceSlider.value);
        formData.append('max_segment_s', maxSegmentSlider.value);
        formData.append('padding_ms', paddingSlider.value);

        try {
            const res = await fetch('/analyze', { method: 'POST', body: formData });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Analysis failed');
            }

            analysisResult = data;
            displayResults(data);
            showSnackbar(`Found ${data.segment_count} speech segments`, 'success');
        } catch (err) {
            showSnackbar(err.message || 'Analysis failed. Please try again.', 'error');
            console.error('Analysis error:', err);
        } finally {
            progressSection.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    }

    // ── Display Results ──
    function displayResults(data) {
        resultsSection.classList.remove('hidden');
        resultsSection.style.animation = 'slideUp 0.4s ease both';

        // Summary
        resultsSummary.textContent = `${data.segment_count} segments detected from ${formatTime(data.total_duration)} of audio`;

        // Stats
        const speechTime = data.segments.reduce((sum, s) => sum + s.duration, 0);
        const silenceTime = data.total_duration - speechTime;

        document.getElementById('stat-duration').textContent = formatTime(data.total_duration);
        document.getElementById('stat-segments').textContent = data.segment_count;
        document.getElementById('stat-speech').textContent = formatTime(speechTime);
        document.getElementById('stat-silence').textContent = formatTime(silenceTime);

        // Timeline labels
        timelineStart.textContent = '0:00';
        timelineEnd.textContent = formatTime(data.total_duration);

        // Draw timeline
        drawTimeline(data);

        // Segments list
        renderSegments(data.segments);

        // Select all by default
        data.segments.forEach(s => selectedSegments.add(s.id));
        updateSegmentSelections();

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ── Timeline Canvas ──
    function drawTimeline(data) {
        const canvas = timelineCanvas;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = 60 * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = '60px';

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        const width = rect.width;
        const height = 60;

        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        const gridCount = Math.min(20, Math.floor(data.total_duration / 5));
        for (let i = 0; i <= gridCount; i++) {
            const x = (i / gridCount) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Silence background
        ctx.fillStyle = 'rgba(239, 68, 68, 0.06)';
        ctx.fillRect(0, 10, width, height - 20);

        // Speech segments
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.6)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.6)');

        data.segments.forEach(seg => {
            const x = (seg.start / data.total_duration) * width;
            const w = Math.max(2, (seg.duration / data.total_duration) * width);
            const r = Math.min(3, w / 2);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, 8, w, height - 16, r);
            ctx.fill();

            // Glow
            ctx.shadowColor = 'rgba(99, 102, 241, 0.3)';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    // ── Segments List ──
    function renderSegments(segments) {
        segmentsList.innerHTML = '';
        const maxDuration = Math.max(...segments.map(s => s.duration));

        segments.forEach((seg, idx) => {
            const item = document.createElement('div');
            item.className = 'segment-item';
            item.dataset.id = seg.id;

            const barWidth = (seg.duration / maxDuration * 100).toFixed(1);

            item.innerHTML = `
                <div class="segment-checkbox">
                    <span class="material-icons-round">check</span>
                </div>
                <div class="segment-num">${seg.id}</div>
                <div class="segment-info">
                    <div class="segment-time">${formatTime(seg.start)} → ${formatTime(seg.end)}</div>
                    <div class="segment-duration">${seg.duration.toFixed(1)}s</div>
                </div>
                <div class="segment-bar-wrapper">
                    <div class="segment-bar" style="width: ${barWidth}%"></div>
                </div>
            `;

            item.addEventListener('click', () => toggleSegment(seg.id));

            // Staggered animation
            item.style.animation = `slideUp 0.3s ${idx * 0.03}s ease both`;

            segmentsList.appendChild(item);
        });
    }

    function toggleSegment(id) {
        if (selectedSegments.has(id)) {
            selectedSegments.delete(id);
        } else {
            selectedSegments.add(id);
        }
        updateSegmentSelections();
    }

    function toggleSelectAll() {
        if (!analysisResult) return;
        const allSelected = analysisResult.segments.every(s => selectedSegments.has(s.id));
        if (allSelected) {
            selectedSegments.clear();
        } else {
            analysisResult.segments.forEach(s => selectedSegments.add(s.id));
        }
        updateSegmentSelections();
    }

    function updateSegmentSelections() {
        document.querySelectorAll('.segment-item').forEach(item => {
            const id = parseInt(item.dataset.id);
            item.classList.toggle('selected', selectedSegments.has(id));
        });

        const count = selectedSegments.size;
        downloadBtn.querySelector('span:nth-child(2)').textContent =
            `Download ${count > 0 ? count : 'Selected'} Segment${count !== 1 ? 's' : ''}`;
        downloadBtn.disabled = count === 0;

        // Update select all button text
        if (analysisResult) {
            const allSelected = analysisResult.segments.every(s => selectedSegments.has(s.id));
            selectAllBtn.querySelector('span:last-child').textContent =
                allSelected ? 'Deselect All' : 'Select All';
        }
    }

    // ── Download ──
    async function handleDownload() {
        if (!analysisResult || selectedSegments.size === 0) return;

        progressSection.classList.remove('hidden');
        progressTitle.textContent = 'Preparing segments...';
        progressSubtitle.textContent = `Exporting ${selectedSegments.size} segment${selectedSegments.size > 1 ? 's' : ''} as WAV`;
        downloadBtn.disabled = true;

        const selectedSegs = analysisResult.segments.filter(s => selectedSegments.has(s.id));

        try {
            const res = await fetch('/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: analysisResult.session_id,
                    segments: selectedSegs,
                    format: 'wav'
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Download failed');
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${analysisResult.filename.replace(/\.[^.]+$/, '')}_segments.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showSnackbar(`Downloaded ${selectedSegments.size} segments ✓`, 'success');
        } catch (err) {
            showSnackbar(err.message || 'Download failed', 'error');
            console.error('Download error:', err);
        } finally {
            progressSection.classList.add('hidden');
            downloadBtn.disabled = false;
        }
    }

    // ── Helpers ──
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 10);
        if (mins > 0) {
            return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
        }
        return `${secs}.${ms}s`;
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function showSnackbar(msg, type = 'info') {
        if (snackbarTimeout) clearTimeout(snackbarTimeout);

        const icons = { success: 'check_circle', error: 'error', info: 'info' };
        snackbarIcon.textContent = icons[type] || icons.info;
        snackbarMessage.textContent = msg;
        snackbar.className = `snackbar ${type} visible`;

        snackbarTimeout = setTimeout(() => {
            snackbar.classList.remove('visible');
        }, 3500);
    }

    // Handle window resize for timeline redraw
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (analysisResult) drawTimeline(analysisResult);
        }, 200);
    });
})();
