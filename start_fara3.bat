@echo off
title 𝐹𝒶𝓇𝒶`𝟥 Fashion Store
echo ========================================
echo     Starting 𝐹𝒶𝓇𝒶`𝟥 Fashion Store
echo ========================================
echo.
echo [1] Starting Flask Backend...
start python run.py
echo.
echo [2] Waiting for backend to start...
timeout /t 3 /nobreak >nul
echo.
echo [3] Opening website in browser...
start web.html
echo.
echo ✅ Setup complete!
echo.
echo 📌 Backend: http://127.0.0.1:5000
echo 📌 Frontend: web.html
echo.
pause