@echo off
echo ========================================
echo  WouldYouRather.ai Video Generator
echo  Starting server with CORS headers...
echo ========================================
echo.
echo Server will start on http://localhost:8080
echo Opening browser in 3 seconds...
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start Python HTTP server with CORS headers
python server.py

REM If Python 3 is named python3 instead
if errorlevel 1 (
    python3 server.py
)

pause
