#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "         TESTANDO BACKEND - ROTA DE LOGIN"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Verifica se o .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

# Lê a senha do .env
AUTH_PASSWORD=$(grep AUTH_PASSWORD .env | cut -d '=' -f2)

if [ -z "$AUTH_PASSWORD" ]; then
    AUTH_PASSWORD="mellis123"
    echo "⚠️  AUTH_PASSWORD não encontrado no .env, usando padrão: mellis123"
else
    echo "✓ Senha encontrada no .env: $AUTH_PASSWORD"
fi

echo ""
echo "Testando conexão com o backend..."
echo ""

# Testa o endpoint de login
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"$AUTH_PASSWORD\"}")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

echo "Status HTTP: $http_code"
echo "Resposta: $body"
echo ""

if [ "$http_code" -eq 200 ]; then
    echo "✅ SUCESSO! O backend está funcionando corretamente!"
    echo ""
    echo "Token recebido. O login deve funcionar no navegador."
else
    echo "❌ ERRO! O backend não está respondendo corretamente."
    echo ""
    echo "Possíveis causas:"
    echo "1. Backend não está rodando (execute: npm run dev)"
    echo "2. Senha incorreta no .env"
    echo "3. Porta 3001 não está acessível"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"

