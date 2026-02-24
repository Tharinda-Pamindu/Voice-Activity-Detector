<div align="center">

# 🎙️ Voice Activity Detector

### AI-Powered Audio Segmentation with Silero VAD

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Silero VAD](https://img.shields.io/badge/Silero_VAD-5.1-6366F1?style=for-the-badge)](https://github.com/snakers4/silero-vad)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-06B6D4?style=for-the-badge)](CONTRIBUTING.md)

**Automatically detect speech segments in long audio files and split them into clean, silence-free clips — perfect for feeding into AI models, transcription pipelines, or dataset preparation.**

[Features](#-features) · [Quick Start](#-quick-start) · [Usage](#-usage) · [Configuration](#%EF%B8%8F-configuration) · [Contributing](#-contributing)

</div>

---

## 🎯 The Problem

You can't feed a 10-minute audio file to most AI/ML models at once. You need to cut it into small pieces of **3–10 seconds**. Doing this manually is painful and error-prone.

## ✅ The Solution

This app uses **Silero VAD** (Voice Activity Detection) — a state-of-the-art neural network — to automatically:

1. **Detect** where speech occurs in your audio
2. **Remove** silence gaps between speech segments
3. **Split** the audio into clean, manageable clips (3–10s)
4. **Export** everything as a downloadable ZIP of WAV files

All through a beautiful **Liquid Glass UI** with Material Design components — no command line needed.

---

## ✨ Features

| Feature                 | Description                                                          |
| ----------------------- | -------------------------------------------------------------------- |
| 🧠 **AI-Powered VAD**   | Uses Silero VAD v5 — 87.7% TPR, processes 30ms chunks in <1ms on CPU |
| 🎨 **Liquid Glass UI**  | Frosted-glass cards, animated gradients, Material Design components  |
| 📊 **Visual Timeline**  | Interactive canvas visualization showing speech vs. silence regions  |
| ⚙️ **Fine-Tunable**     | Adjustable sensitivity, min/max duration, silence gap, and padding   |
| 📁 **Multi-Format**     | Supports WAV, MP3, OGG, FLAC, AAC, M4A, WMA, OPUS, WebM              |
| 🖱️ **Drag & Drop**      | Simply drag your audio file into the browser window                  |
| ✅ **Selective Export** | Choose which segments to include in your download                    |
| 📦 **ZIP Download**     | All segments packaged into a single downloadable ZIP                 |
| 💻 **Standalone**       | Pure Python — no Node.js, no npm, just `python app.py`               |

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** — [Download Python](https://python.org/downloads)
- **FFmpeg** _(optional, for MP3/AAC support)_ — [Download FFmpeg](https://ffmpeg.org/download.html)

### Option A: Automated Setup (Windows)

```bash
git clone https://github.com/Tharinda-Pamindu/Voice-Activity-Detector.git
cd Voice-Activity-Detector
setup.bat
```

### Option B: Manual Setup

```bash
# Clone the repository
git clone https://github.com/Tharinda-Pamindu/Voice-Activity-Detector.git
cd Voice-Activity-Detector

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

# Install PyTorch (CPU-only — lightweight ~150MB)
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install remaining dependencies
pip install flask silero-vad pydub soundfile librosa numpy

# Run the app
python app.py
```

Then open **http://localhost:5000** in your browser 🎉

---

## 📖 Usage

### 1. Upload Your Audio

Drag and drop any audio file (WAV, MP3, FLAC, OGG, etc.) into the upload zone, or click to browse.

### 2. Configure VAD Settings

Fine-tune the detection parameters using the intuitive sliders:

| Setting                   | Default | Description                                     |
| ------------------------- | ------- | ----------------------------------------------- |
| **Detection Sensitivity** | 0.50    | Higher = stricter speech detection (0.1 – 0.95) |
| **Min Speech Duration**   | 250ms   | Ignore speech segments shorter than this        |
| **Min Silence Duration**  | 300ms   | Minimum silence gap to split segments           |
| **Max Segment Length**    | 10s     | Automatically split segments longer than this   |
| **Padding**               | 200ms   | Extra audio buffer around each segment          |

### 3. Analyze

Click **"Analyze Audio"** — the app will process your file with Silero VAD and display:

- A visual **timeline** showing speech (highlighted) vs. silence regions
- **Statistics** — total duration, segment count, speech time, silence removed
- A **segment list** with timestamps and duration bars

### 4. Download

Select the segments you want, then click **"Download Selected Segments"** to get a ZIP file containing numbered WAV clips.

---

## ⚙️ Configuration

### VAD Parameters (via UI sliders)

| Parameter        | Range      | Impact                                                                        |
| ---------------- | ---------- | ----------------------------------------------------------------------------- |
| `threshold`      | 0.1 – 0.95 | Lower = more sensitive (catches quiet speech), Higher = fewer false positives |
| `min_speech_ms`  | 100 – 2000 | Filters out very short sounds (coughs, clicks)                                |
| `min_silence_ms` | 100 – 3000 | Controls how long a pause must be to split segments                           |
| `max_segment_s`  | 3 – 30     | Forces long monologues to be split at this length                             |
| `padding_ms`     | 0 – 500    | Adds a buffer to avoid cutting off word beginnings/endings                    |

### GPU Support

By default, this app installs CPU-only PyTorch for a smaller footprint. To use GPU acceleration:

```bash
# Replace step 2 with CUDA-enabled PyTorch
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
```

---

## 📁 Project Structure

```
Voice-Activity-Detector/
├── app.py                 # Flask backend + VAD processing engine
├── requirements.txt       # Python dependencies
├── setup.bat              # Windows automated setup script
├── templates/
│   └── index.html         # Main HTML page (Liquid Glass UI)
├── static/
│   ├── style.css          # Liquid Glass + Material Design styles
│   └── app.js             # Frontend logic (upload, timeline, download)
├── .gitignore
├── LICENSE                # MIT License
├── CONTRIBUTING.md        # Contribution guidelines
└── README.md
```

---

## 🛠️ Tech Stack

| Component            | Technology                                                     |
| -------------------- | -------------------------------------------------------------- |
| **VAD Engine**       | [Silero VAD](https://github.com/snakers4/silero-vad) v5 (ONNX) |
| **Backend**          | Flask 3.0 (Python)                                             |
| **Audio Processing** | PyTorch, torchaudio, pydub, soundfile, librosa                 |
| **Frontend**         | Vanilla HTML/CSS/JS                                            |
| **Design**           | Liquid Glass UI + Material Design                              |
| **Fonts**            | Inter, Outfit (Google Fonts)                                   |
| **Icons**            | Material Icons Round                                           |

---

## 🤝 Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Our commit message convention
- Code style guidelines
- How to submit pull requests

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Silero VAD](https://github.com/snakers4/silero-vad) — State-of-the-art voice activity detection
- [Flask](https://flask.palletsprojects.com) — Lightweight Python web framework
- [PyTorch](https://pytorch.org) — Deep learning framework
- [Google Material Design](https://material.io) — Design system inspiration

---

<div align="center">

**Built with ❤️ by [Tharinda Pamindu](https://github.com/Tharinda-Pamindu)**

⭐ Star this repo if you find it useful!

</div>
