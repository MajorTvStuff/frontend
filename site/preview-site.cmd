@echo off
rem MAJOR CONTENT - double-click to see the built site (site\out) working.
rem
rem Double-clicking out\index.html itself cannot work: every path in it starts
rem at the site's root (/_next/..., /brand/...), and on disk that root is C:\,
rem so nothing loads. This serves the folder the way the host will, on
rem http://localhost:3013 (3000 belongs to another app on this machine), and
rem opens it in the browser. Rebuild the folder with:  python scripts\export-static.py
title MAJOR CONTENT - site preview
cd /d "%~dp0"
if not exist "out\index.html" (
  echo There is no built site yet. In this folder run:  python scripts\export-static.py
  pause
  exit /b 1
)
rem already being served: just open it
powershell -NoProfile -Command "try { $null = Invoke-WebRequest 'http://localhost:3013/' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }"
if not errorlevel 1 (
  start "" http://localhost:3013/
  exit /b 0
)
echo Showing site\out at http://localhost:3013  -  close this window to stop.
npx --yes http-server@14 out -p 3013 -c-1 -s -o
