@echo off
:: ============================================================
::  RestaurantPOS — Print Agent Launcher
::  Run this on the billing counter PC (NOT on the VPS).
::
::  BEFORE FIRST RUN — change the 3 lines marked with <--
:: ============================================================

set SERVER=http://YOUR_VPS_IP_OR_DOMAIN:5000     <-- e.g. http://103.45.67.89:5000  or  https://pos.yourrestaurant.com
set USERNAME=admin                                <-- your POS login username
set PASSWORD=admin123                            <-- your POS login password

:: ── Do not change anything below this line ──────────────────

title RestaurantPOS Print Agent

:: Check Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Download from https://python.org and tick "Add Python to PATH" during install.
    pause
    exit /b 1
)

:: Install requests if missing
pip show requests >nul 2>&1
if errorlevel 1 (
    echo Installing required package: requests...
    pip install requests
)

echo.
echo =============================================
echo  RestaurantPOS Print Agent
echo  Server  : %SERVER%
echo  Username: %USERNAME%
echo  Press Ctrl+C to stop
echo =============================================
echo.

:loop
python "%~dp0print-agent.py" --server %SERVER% --username %USERNAME% --password %PASSWORD%
echo.
echo Agent stopped or crashed — restarting in 5 seconds...
timeout /t 5 /nobreak >nul
goto loop
