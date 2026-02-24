# Contributing to Voice Activity Detector

Thank you for your interest in contributing! 🎉 This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Style Guide](#style-guide)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code. Please be respectful, inclusive, and constructive in all interactions.

## How Can I Contribute?

### 🐛 Report Bugs

Found a bug? [Open an issue](https://github.com/Tharinda-Pamindu/Voice-Activity-Detector/issues/new?template=bug_report.md) with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Your environment details (OS, Python version, browser)
- Audio file format that caused the issue (if applicable)

### 💡 Suggest Features

Have an idea? [Open a feature request](https://github.com/Tharinda-Pamindu/Voice-Activity-Detector/issues/new?template=feature_request.md) with:

- A clear description of the feature
- Why it would be useful
- Any implementation ideas you have

### 🔧 Submit Pull Requests

Ready to code? Follow the steps below.

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Git

### Setup

1. **Fork** the repository on GitHub.

2. **Clone** your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/Voice-Activity-Detector.git
   cd Voice-Activity-Detector
   ```

3. **Create a virtual environment** and install dependencies:

   ```bash
   python -m venv .venv

   # Windows
   .venv\Scripts\activate

   # macOS/Linux
   source .venv/bin/activate

   # Install PyTorch (CPU)
   pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu

   # Install remaining dependencies
   pip install flask silero-vad pydub soundfile librosa numpy
   ```

4. **Run the app** to verify everything works:
   ```bash
   python app.py
   ```

## Development Workflow

1. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** — keep commits small and focused.

3. **Test your changes** thoroughly:
   - Upload various audio formats (WAV, MP3, FLAC, OGG)
   - Test with different VAD settings
   - Verify the UI renders correctly on different screen sizes
   - Check that segment export works

4. **Commit** with a clear message:

   ```bash
   git commit -m "feat: add support for real-time waveform preview"
   ```

5. **Push** and create a Pull Request:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix      | Purpose                          |
| ----------- | -------------------------------- |
| `feat:`     | New feature                      |
| `fix:`      | Bug fix                          |
| `docs:`     | Documentation only               |
| `style:`    | CSS/formatting (no logic change) |
| `refactor:` | Code restructuring               |
| `perf:`     | Performance improvement          |
| `test:`     | Adding tests                     |
| `chore:`    | Build/tooling changes            |

## Style Guide

### Python (Backend)

- Follow [PEP 8](https://peps.python.org/pep-0008/) conventions
- Use type hints where appropriate
- Keep functions focused and under 50 lines
- Add docstrings to all public functions

### JavaScript (Frontend)

- Use `'use strict'` mode
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names
- Comment complex logic

### CSS

- Follow the existing Liquid Glass design system
- Use CSS custom properties (variables) from `:root`
- Keep selectors specific but not overly nested
- Maintain the dark theme aesthetic

## Reporting Bugs

When reporting bugs, please include:

- **Environment**: OS, Python version, browser, screen resolution
- **Audio file**: Format, duration, sample rate (if relevant)
- **VAD settings**: Threshold, min speech/silence duration, etc.
- **Console output**: Any error messages from the terminal or browser console
- **Screenshots**: If it's a UI issue

---

## 🙏 Thank You!

Every contribution, no matter how small, makes a difference. Whether it's fixing a typo, reporting a bug, or adding a feature — you're helping make this tool better for everyone.

If you have questions, feel free to [open a discussion](https://github.com/Tharinda-Pamindu/Voice-Activity-Detector/discussions) or reach out.
