@echo off
echo ========================================
echo  WouldYouRather.ai Video Generator
echo  Starting server with CORS headers...
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Start the server
echo Starting server on http://localhost:8080
echo.
python server.py

pause
