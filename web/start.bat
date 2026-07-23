@echo off
setlocal enabledelayedexpansion
title Service Link - Next.js
color 0A

echo ========================================
echo   Service Link - Next.js Dev Server
echo ========================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH.
    pause
    exit /b 1
)

echo Checking for existing server on port 3000...
powershell -NoProfile -Command ^
  "$pids = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; if ($pids) { foreach ($pid in $pids) { Write-Host ('Stopping process on port 3000 (PID ' + $pid + ')...'); Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } Start-Sleep -Seconds 2 }"

if exist ".next\dev\lock" del ".next\dev\lock" 2>nul

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: npm install failed.
        pause
        exit /b 1
    )
    echo.
)

echo Starting Next.js dev server...
echo.
echo App will be available at:
echo   http://localhost:3000
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "$addrs = Get-NetIPAddress -AddressFamily IPv4 -PrefixOrigin Dhcp,Manual -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -ne '127.0.0.1' } | Select-Object -ExpandProperty IPAddress; if ($addrs) { $addrs } else { (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -ExpandProperty IPAddress) }"`) do echo   http://%%i:3000
echo.
echo Press Ctrl+C to stop the server.
echo.

set PORT=3000
call npm run dev

if errorlevel 1 (
    echo.
    echo Error: Failed to start the dev server.
    echo If port 3000 is still in use, close other terminals running npm run dev.
    pause
    exit /b 1
)
