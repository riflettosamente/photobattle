#!/bin/bash
cd "$(dirname "$0")"

echo "========================================================"
echo "               PHOTO BATTLE LAUNCHER"
echo "========================================================"
echo

if ! command -v node &> /dev/null; then
    echo "[ATTENZIONE] Node.js NON e' stato rilevato su questo Mac!"
    echo "Scaricalo da https://nodejs.org/ e riavvia il Mac."
    echo
    read -p "Premi Invio per chiudere..."
    exit 1
fi

if [ ! -f "node_modules/.bin/vite" ]; then
    echo "[INFO] Prima configurazione delle componenti in corso..."
    echo "Attendere qualche secondo..."
    npm install --legacy-peer-deps
fi

echo "Avvio di Photo Battle e apertura del browser..."
npm run dev -- --open
