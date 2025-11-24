#!/bin/bash

# Script de Deploy - Front-end Radar
# Uso: ./deploy.sh

set -e  # Para execução em caso de erro

echo "🚀 Iniciando deploy do Front-end..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado. Execute este script no diretório do front-end.${NC}"
    exit 1
fi

# Verificar se .env.production existe
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Erro: .env.production não encontrado.${NC}"
    echo -e "${YELLOW}Copie o arquivo env.production.template para .env.production e configure as variáveis.${NC}"
    exit 1
fi

# Backup do .env.production
echo -e "${YELLOW}📦 Fazendo backup do .env.production...${NC}"
cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)

# Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install --production

# Build da aplicação
echo -e "${YELLOW}🔨 Fazendo build do Next.js...${NC}"
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
if pm2 list | grep -q "radar-frontend"; then
    echo -e "${YELLOW}🔄 Reiniciando aplicação...${NC}"
    pm2 restart radar-frontend
else
    echo -e "${YELLOW}▶️  Iniciando aplicação...${NC}"
    pm2 start ecosystem.config.js
fi

# Salvar configuração do PM2
pm2 save

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo -e "${YELLOW}📊 Status da aplicação:${NC}"
pm2 status radar-frontend

echo ""
echo -e "${YELLOW}📝 Para ver os logs:${NC}"
echo "   pm2 logs radar-frontend"

echo ""
echo -e "${YELLOW}🌐 Aplicação disponível em:${NC}"
echo "   https://radardados.ativos.com"
