#!/bin/bash

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Iniciando Finanças Pessoais..."

# Inicia o backend
node --experimental-sqlite "$ROOT/backend/src/index.js" &
BACKEND_PID=$!
echo "✅ Backend rodando (PID $BACKEND_PID) em http://localhost:3001"

# Inicia o frontend
cd "$ROOT/frontend" && npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend rodando (PID $FRONTEND_PID) em http://localhost:5173"

echo ""
echo "📌 Acesse: http://localhost:5173"
echo "   Login: alicelinsc.malzac@gmail.com"
echo "   Senha: finance2025"
echo ""
echo "Pressione Ctrl+C para encerrar..."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servidores encerrados.'" EXIT
wait
