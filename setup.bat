@echo off
echo ============================================
echo   Voice Activity Detector - Environment Setup
echo ============================================
echo.

:: Create virtual environment
echo [1/3] Creating virtual environment...
python -m venv .venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment.
    echo Make sure Python 3.10+ is installed and in PATH.
    pause
    exit /b 1
)
echo       Done.
echo.

:: Activate virtual environment
echo [2/3] Activating virtual environment...
call .venv\Scripts\activate.bat
echo       Done.
echo.

:: Install PyTorch CPU-only (smaller and faster)
echo [3/4] Installing PyTorch (CPU-only)...
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
if errorlevel 1 (
    echo ERROR: Failed to install PyTorch.
    pause
    exit /b 1
)
echo       Done.
echo.

:: Install remaining dependencies
echo [4/4] Installing remaining dependencies...
pip install flask silero-vad pydub soundfile librosa numpy
if errorlevel 1 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)
echo       Done.
echo.

echo ============================================
echo   Setup complete! 
echo   To run the app:
echo     .venv\Scripts\activate
echo     python app.py
echo ============================================
pause
