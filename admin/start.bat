@echo off
setlocal enabledelayedexpansion
title Servicelink Admin
color 0B

echo ========================================
echo   Servicelink - Super Admin Dev Server
echo ========================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH.
    pause
    exit /b 1
)

REM Clear stale Next.js cache (fixes middleware/proxy migration errors)
if exist ".next\" (
    echo Clearing .next cache...
    rmdir /s /q ".next" 2>nul
)

REM Stop an existing Next.js dev server for this project
if exist ".next\dev\lock" (
    for /f "usebackq delims=" %%P in (`powershell -NoProfile -Command "try { (Get-Content '.next\dev\lock' -Raw | ConvertFrom-Json).pid } catch { '' }"`) do set EXISTING_PID=%%P
    if defined EXISTING_PID (
        tasklist /FI "PID eq !EXISTING_PID!" 2>nul | find /I "node.exe" >nul
        if not errorlevel 1 (
            echo Stopping existing Next.js dev server ^(PID !EXISTING_PID!^)...
            taskkill /PID !EXISTING_PID! /F >nul 2>&1
            timeout /t 2 /nobreak >nul
        )
    )
    del ".next\dev\lock" 2>nul
)

REM Fallback: free port 3001 if another node process is still listening
for /f "tokens=5" %%A in ('netstat -ano ^| findstr ":3001.*LISTENING"') do (
    tasklist /FI "PID eq %%A" 2>nul | find /I "node.exe" >nul
    if not errorlevel 1 (
        echo Stopping process on port 3001 ^(PID %%A^)...
        taskkill /PID %%A /F >nul 2>&1
        timeout /t 2 /nobreak >nul
    )
)

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

if not exist ".env" (
    if exist ".env.example" (
        echo Creating .env from .env.example...
        copy /Y ".env.example" ".env" >nul
        echo Update .env with your DATABASE_URL if needed.
        echo.
    )
)

echo Starting admin dev server...
echo.
echo Admin panel: http://localhost:3001
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "$addrs = Get-NetIPAddress -AddressFamily IPv4 -PrefixOrigin Dhcp,Manual -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -ne '127.0.0.1' } | Select-Object -ExpandProperty IPAddress; if ($addrs) { $addrs } else { (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -ExpandProperty IPAddress) }"`) do echo LAN access:  http://%%i:3001
echo Login:       admin@servicelink.net.au
echo.
echo Press Ctrl+C to stop the server.
echo.

call npm run dev

if errorlevel 1 (
    echo.
    echo Error: Failed to start the dev server.
    pause
    exit /b 1
)
