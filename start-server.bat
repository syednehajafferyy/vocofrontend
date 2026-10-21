@echo off
title VOCO Rooftop Server
echo Starting VOCO Rooftop Restaurant server...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
