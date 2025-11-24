#!/bin/bash

# Script de Deploy - Back-end Radar API
# Uso: ./deploy.sh

set -e  # Para execução em caso de erro

echo "🚀 Iniciando deploy do Back-end..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado. Execute este script no diretório do back-end.${NC}"
    exit 1
fi

# Backup do .env
if [ -f ".env" ]; then
    echo -e "${YELLOW}📦 Fazendo backup do .env...${NC}"
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install --production

# Gerar Prisma Client
echo -e "${YELLOW}🔧 Gerando Prisma Client...${NC}"
npm run prisma:generate

# Executar migrations
echo -e "${YELLOW}🗄️  Executando migrations...${NC}"
npm run prisma:migrate:deploy

# Build da aplicação
echo -e "${YELLOW}🔨 Fazendo build...${NC}"
npm run build

# Criar diretório de logs se não existir
if [ ! -d "logs" ]; then
    echo -e "${YELLOW}📁 Criando diretório de logs...${NC}"
    mkdir -p logs
fi

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 não está instalado. Instale com: npm install -g pm2${NC}"
    exit 1
fi

# Reiniciar ou iniciar aplicação com PM2
if pm2 list | grep -q "radar-api"; then
    echo -e "${YELLOW}🔄 Reiniciando aplicação...${NC}"
    pm2 restart radar-api
else
    echo -e "${YELLOW}▶️  Iniciando aplicação...${NC}"
    pm2 start ecosystem.config.js
fi

# Salvar configuração do PM2
pm2 save

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo -e "${YELLOW}📊 Status da aplicação:${NC}"
pm2 status radar-api

echo ""
echo -e "${YELLOW}📝 Para ver os logs:${NC}"
echo "   pm2 logs radar-api"
