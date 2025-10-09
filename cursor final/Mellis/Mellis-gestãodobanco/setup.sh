#!/bin/bash

echo "🚀 Configurando Mellis CRM..."

if [ ! -f .env ]; then
  echo "📝 Criando arquivo .env..."
  cp .env.example .env
  echo "⚠️  IMPORTANTE: Configure a variável NEON_DATABASE_URL no arquivo .env"
else
  echo "✓ Arquivo .env já existe"
fi

echo "📦 Instalando dependências..."
npm install

echo "✅ Setup concluído!"
echo ""
echo "Para rodar o projeto:"
echo "  1. Configure o .env com sua string de conexão do PostgreSQL"
echo "  2. Execute: npm run dev (backend)"
echo "  3. Em outro terminal: npm run preview (frontend)"
echo ""
echo "O backend rodará em: http://localhost:3001"
echo "O frontend rodará em: http://localhost:5173"

