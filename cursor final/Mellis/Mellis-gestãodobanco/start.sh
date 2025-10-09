#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "                    MELLIS CRM - INICIANDO"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Verifica se o .env existe
if [ ! -f .env ]; then
    echo "⚠️  ATENÇÃO: Arquivo .env não encontrado!"
    echo ""
    echo "Crie um arquivo .env com as seguintes variáveis:"
    echo "NEON_DATABASE_URL=postgresql://..."
    echo "PORT=3001"
    echo "NODE_ENV=development"
    echo "CORS_ORIGIN=http://localhost:5173"
    echo "JWT_SECRET=sua-chave-secreta"
    echo "AUTH_PASSWORD=sua-senha"
    echo ""
    echo "Consulte .env.example para mais detalhes."
    echo ""
    exit 1
fi

# Verifica se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

echo "🚀 Iniciando servidores..."
echo ""
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
echo "⚠️  IMPORTANTE: Execute a migração SQL antes de usar!"
echo "   Arquivo: migration-add-status.sql"
echo ""
echo "🔐 Acesse http://localhost:5173 e faça login"
echo ""
echo "Para parar os servidores, pressione Ctrl+C"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Inicia backend e frontend em paralelo
npm run dev & npm run dev:frontend

wait

