@echo off
cd /d "%~dp0"
title Photo Battle Launcher
cls

echo ========================================================
echo               PHOTO BATTLE LAUNCHER
echo ========================================================
echo.

:: 1. VERIFICA PRESENZA NODE.JS
node -v >nul 2>&1
if errorlevel 1 goto NONODE

:: 2. VERIFICA PRESENZA DI VITE IN NODE_MODULES
if exist "node_modules\.bin\vite.cmd" goto STARTAPP

echo [INFO] Prima configurazione delle componenti in corso sul tuo PC...
echo Attendere circa 30-45 secondi (operazione necessaria solo al primo avvio)...
echo.
call npm install --legacy-peer-deps
if errorlevel 1 goto INSTALLERROR

:STARTAPP
echo.
echo ========================================================
echo [OK] Avvio di Photo Battle e apertura del browser in corso!
echo ========================================================
echo.
call npm run dev -- --open
goto END

:NONODE
echo.
echo ========================================================
echo [ATTENZIONE] Node.js NON e' stato rilevato da Windows!
echo ========================================================
echo.
echo Se hai appena installato Node.js:
echo -> Devi RIAVVIARE IL COMPUTER per far aggiornare Windows.
echo.
echo Se NON l'hai ancora installato:
echo -> Scarica e installa Node.js da: https://nodejs.org/
echo.
goto END

:INSTALLERROR
echo.
echo [ERRORE] Impossibile completare l'installazione delle dipendenze.
echo Verificare la connessione ad internet e riprovare.
echo.

:END
echo.
echo Premi un tasto per chiudere questa finestra...
pause
