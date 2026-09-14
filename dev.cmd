@echo off
setlocal
cd /d "%~dp0"
echo Starting Codex Harness Arena (Port 5174)...
pnpm dev
if errorlevel 1 pause
endlocal
