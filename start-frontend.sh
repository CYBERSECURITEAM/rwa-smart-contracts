#!/bin/bash

echo "🚀 Démarrage du serveur frontend RWA..."
echo "📍 Dossier: /Users/adama/Documents/Blockchain/rwa-smart-contracts/frontend"
echo ""

cd "/Users/adama/Documents/Blockchain/rwa-smart-contracts/frontend"

# Trouver un port disponible
PORT=3000
while lsof -i :$PORT > /dev/null 2>&1; do
    PORT=$((PORT + 1))
done

echo "🌐 Serveur disponible sur:"
echo "   - Interface simple: http://localhost:$PORT/simple.html"
echo "   - Interface complète: http://localhost:$PORT/index.html"
echo ""
echo "⏹️  Pour arrêter le serveur, appuyez sur Ctrl+C"
echo ""

# Démarrer le serveur Python
python3 -m http.server $PORT