@echo off
title TimeTrack Pro
echo Starter TimeTrack Pro...
echo.

start "TimeTrack — Backend" wsl -d Ubuntu bash -c "cd ~/timetrack-pro/backend && echo '' && echo '  === TimeTrack Backend ===' && echo '' && npm run dev; read -p 'Tryk Enter for at lukke...'"
timeout /t 2 /nobreak >nul
start "TimeTrack — Frontend" wsl -d Ubuntu bash -c "cd ~/timetrack-pro/frontend && echo '' && echo '  === TimeTrack Frontend ===' && echo '' && npm start; read -p 'Tryk Enter for at lukke...'"

echo.
echo App starter i to vinduer.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
timeout /t 4 /nobreak >nul
