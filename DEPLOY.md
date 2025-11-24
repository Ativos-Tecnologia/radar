# 🚀 Guia de Deploy - Sistema Radar (CloudPanel)

## 📋 Informações do Servidor

### Back-end
- **URL:** https://radardadosapi.ativos.com
- **Porta:** 3030
- **Node:** 22 LTS
- **Diretório:** `/home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com`

### Front-end
- **URL:** https://radardados.ativos.com
- **Porta:** 3003
- **Node:** 22 LTS
- **Diretório:** `/home/ativos-radardados/htdocs/radardados.ativos.com`

---

## 🔧 Pré-requisitos no Servidor

```bash
# Verificar versão do Node
node -v  # Deve ser v22.x.x

# Instalar PM2 globalmente (se ainda não tiver)
npm install -g pm2

# Instalar pnpm (opcional, mas recomendado)
npm install -g pnpm
```

---

## 📦 DEPLOY DO BACK-END

### 1. Fazer Upload dos Arquivos

```bash
# No diretório: /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com

# Fazer upload de todos os arquivos do back-end
# Ou clonar do repositório Git:
git clone <seu-repositorio> .
cd back-end
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar template e editar
cp .env.production.example .env

# Editar o arquivo .env com os valores reais:
nano .env
```

**Conteúdo do .env:**
```env
# Database - IMPORTANTE: Ajustar com dados reais do MySQL
DATABASE_URL="mysql://usuario_db:senha_db@localhost:3306/radar_production"

# JWT - GERAR UMA CHAVE SEGURA ÚNICA
JWT_SECRET="gerar-chave-aleatoria-minimo-32-caracteres-super-segura"

# Server
PORT=3030
NODE_ENV=production

# CORS
FRONTEND_URL=https://radardados.ativos.com

# API URL
API_URL=https://radardadosapi.ativos.com
```

### 3. Instalar Dependências

```bash
# Usar npm ou pnpm
npm install --production

# OU
pnpm install --prod
```

### 4. Configurar Prisma e Banco de Dados

```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrations (cria tabelas no banco)
npm run prisma:migrate:deploy

# (Opcional) Popular banco com dados iniciais
npm run prisma:seed
```

### 5. Build da Aplicação

```bash
npm run build
```

### 6. Criar Diretório de Logs

```bash
mkdir -p logs
```

### 7. Iniciar com PM2

```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Executar o comando que o PM2 mostrar

# Verificar status
pm2 status
pm2 logs radar-api
```

### 8. Configurar Nginx/CloudPanel

No CloudPanel, configurar o site para fazer proxy reverso:

**Nginx Config (adicionar no vhost):**
```nginx
location /api {
    proxy_pass http://localhost:3030;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Para WebSocket (notificações)
location /socket.io {
    proxy_pass http://localhost:3030;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

---

## 🎨 DEPLOY DO FRONT-END

### 1. Fazer Upload dos Arquivos

```bash
# No diretório: /home/ativos-radardados/htdocs/radardados.ativos.com

# Fazer upload ou clonar
git clone <seu-repositorio> .
cd front-end
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp env.production.template .env.production

# Conteúdo do .env.production:
NEXT_PUBLIC_API_URL=https://radardadosapi.ativos.com/api/v1
```

### 3. Instalar Dependências

```bash
npm install --production

# OU
pnpm install --prod
```

### 4. Build da Aplicação

```bash
npm run build
```

### 5. Criar Diretório de Logs

```bash
mkdir -p logs
```

### 6. Iniciar com PM2

```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Verificar status
pm2 status
pm2 logs radar-frontend
```

### 7. Configurar Nginx/CloudPanel

No CloudPanel, configurar o site:

**Nginx Config:**
```nginx
location / {
    proxy_pass http://localhost:3003;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 🔄 Comandos Úteis PM2

```bash
# Ver status de todas as aplicações
pm2 status

# Ver logs em tempo real
pm2 logs

# Ver logs de uma aplicação específica
pm2 logs radar-api
pm2 logs radar-frontend

# Reiniciar aplicação
pm2 restart radar-api
pm2 restart radar-frontend

# Parar aplicação
pm2 stop radar-api
pm2 stop radar-frontend

# Remover aplicação
pm2 delete radar-api
pm2 delete radar-frontend

# Monitoramento
pm2 monit

# Listar processos
pm2 list
```

---

## 🔐 Segurança - IMPORTANTE!

### 1. Gerar JWT Secret Seguro

```bash
# Gerar chave aleatória de 64 caracteres
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Permissões de Arquivos

```bash
# Back-end
chmod 600 /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com/.env

# Front-end
chmod 600 /home/ativos-radardados/htdocs/radardados.ativos.com/.env.production
```

### 3. Firewall

Garantir que apenas as portas necessárias estejam abertas:
- **3030** (back-end) - apenas localhost
- **3003** (front-end) - apenas localhost
- **80/443** (Nginx) - público

---

## 🗄️ Banco de Dados MySQL

### Criar Banco de Dados

```sql
-- Conectar no MySQL
mysql -u root -p

-- Criar banco
CREATE DATABASE radar_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário
CREATE USER 'radar_user'@'localhost' IDENTIFIED BY 'senha-super-segura-aqui';

-- Dar permissões
GRANT ALL PRIVILEGES ON radar_production.* TO 'radar_user'@'localhost';
FLUSH PRIVILEGES;

-- Sair
EXIT;
```

### Backup do Banco

```bash
# Fazer backup
mysqldump -u radar_user -p radar_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
mysql -u radar_user -p radar_production < backup_20241124_172500.sql
```

---

## 🔄 Atualização (Deploy de Novas Versões)

### Back-end

```bash
cd /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com

# Fazer backup do .env
cp .env .env.backup

# Atualizar código (Git ou upload)
git pull origin main

# Instalar novas dependências
npm install --production

# Executar migrations (se houver)
npm run prisma:migrate:deploy

# Rebuild
npm run build

# Reiniciar PM2
pm2 restart radar-api

# Verificar logs
pm2 logs radar-api --lines 100
```

### Front-end

```bash
cd /home/ativos-radardados/htdocs/radardados.ativos.com

# Fazer backup do .env.production
cp .env.production .env.production.backup

# Atualizar código
git pull origin main

# Instalar novas dependências
npm install --production

# Rebuild
npm run build

# Reiniciar PM2
pm2 restart radar-frontend

# Verificar logs
pm2 logs radar-frontend --lines 100
```

---

## 🐛 Troubleshooting

### Aplicação não inicia

```bash
# Ver logs detalhados
pm2 logs radar-api --lines 200
pm2 logs radar-frontend --lines 200

# Verificar se a porta está em uso
netstat -tulpn | grep 3030
netstat -tulpn | grep 3003

# Verificar variáveis de ambiente
pm2 env 0  # ID do processo
```

### Erro de conexão com banco

```bash
# Testar conexão MySQL
mysql -u radar_user -p -h localhost radar_production

# Verificar DATABASE_URL no .env
cat .env | grep DATABASE_URL
```

### Erro de CORS

- Verificar se `FRONTEND_URL` no back-end está correto
- Verificar se `NEXT_PUBLIC_API_URL` no front-end está correto

### Aplicação lenta

```bash
# Ver uso de recursos
pm2 monit

# Aumentar memória se necessário (ecosystem.config.js)
max_memory_restart: '1G'
```

---

## 📊 Monitoramento

### Logs

```bash
# Logs em tempo real
pm2 logs

# Últimas 100 linhas
pm2 logs --lines 100

# Limpar logs
pm2 flush
```

### Status

```bash
# Status resumido
pm2 status

# Informações detalhadas
pm2 info radar-api
pm2 info radar-frontend
```

---

## ✅ Checklist de Deploy

### Back-end
- [ ] Código enviado para o servidor
- [ ] `.env` configurado com valores de produção
- [ ] `JWT_SECRET` gerado e configurado
- [ ] Banco de dados criado
- [ ] `DATABASE_URL` configurado corretamente
- [ ] Dependências instaladas (`npm install`)
- [ ] Prisma Client gerado (`npm run prisma:generate`)
- [ ] Migrations executadas (`npm run prisma:migrate:deploy`)
- [ ] Seed executado (opcional)
- [ ] Build realizado (`npm run build`)
- [ ] PM2 iniciado e salvo
- [ ] Nginx configurado
- [ ] SSL/HTTPS configurado
- [ ] Logs verificados

### Front-end
- [ ] Código enviado para o servidor
- [ ] `.env.production` configurado
- [ ] `NEXT_PUBLIC_API_URL` apontando para back-end
- [ ] Dependências instaladas
- [ ] Build realizado (`npm run build`)
- [ ] PM2 iniciado e salvo
- [ ] Nginx configurado
- [ ] SSL/HTTPS configurado
- [ ] Logs verificados
- [ ] Teste de navegação funcionando

---

## 🎯 Primeiro Acesso

Após deploy completo:

1. Acesse: https://radardados.ativos.com
2. Faça login com usuário admin padrão (criado no seed)
3. **IMPORTANTE:** Altere a senha padrão imediatamente!

---

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `pm2 logs`
2. Verificar status: `pm2 status`
3. Verificar conexão com banco de dados
4. Verificar configurações do Nginx
5. Verificar certificado SSL

---

**Última atualização:** 24/11/2024
