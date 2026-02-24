@echo off
title Voice Activity Detector
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║     Voice Activity Detector              ║
echo  ║     Starting application...              ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Activate virtual environment
call "%~dp0.venv\Scripts\activate.bat"
if errorlevel 1 (
    echo [ERROR] Virtual environment not found.
    echo         Run setup.bat first to create it.
    pause
    exit /b 1
)

:: Open browser after a short delay (runs in background)
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5000"

:: Start Flask app (this blocks until you close it)
echo [INFO] Server starting at http://localhost:5000
echo [INFO] Press Ctrl+C to stop the server
echo.
python "%~dp0app.py"

pause
