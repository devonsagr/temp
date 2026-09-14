@echo off
setlocal
cd /d "%~dp0"
echo Starting Production Preview Server on port 5174...
pnpm preview
if errorlevel 1 pause
endlocal
