@echo off
echo Starting 𝐹𝒶𝓇𝒶`𝟥 Flask Backend...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH!
    echo Please install Python 3.8 or higher from python.org
    pause
    exit /b 1
)

REM Install requirements
echo Installing requirements...
pip install -r requirements.txt

REM Run the Flask app
echo.
echo Starting Flask server...
echo.
python app.py

pause