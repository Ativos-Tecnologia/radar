# 📋 Informações de Produção - Sistema Radar

## 🌐 URLs e Portas

### Back-end (API)
- **URL Pública:** https://radardadosapi.ativos.com
- **Porta Interna:** 3030 (localhost)
- **Diretório:** `/home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com`
- **Node Version:** 22 LTS
- **PM2 Name:** `radar-api`

### Front-end
- **URL Pública:** https://radardados.ativos.com
- **Porta Interna:** 3003 (localhost)
- **Diretório:** `/home/ativos-radardados/htdocs/radardados.ativos.com`
- **Node Version:** 22 LTS
- **PM2 Name:** `radar-frontend`

---

## 🗄️ Banco de Dados

- **Host:** localhost
- **Porta:** 3306 (padrão MySQL)
- **Database:** `radar_production`
- **User:** `radar_user`
- **Charset:** utf8mb4
- **Collation:** utf8mb4_unicode_ci

---

## 📁 Estrutura de Diretórios

### Back-end
```
/home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com/
├── dist/                    # Build compilado (gerado)
├── logs/                    # Logs do PM2
├── node_modules/            # Dependências
├── prisma/                  # Schema e migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/                     # Código fonte
│   ├── aportes/
│   ├── auth/
│   ├── entes/
│   ├── precatorios/
│   ├── rcl/
│   └── users/
├── .env                     # Variáveis de ambiente (NÃO versionar)
├── ecosystem.config.js      # Config PM2
├── package.json
└── deploy.sh               # Script de deploy
```

### Front-end
```
/home/ativos-radardados/htdocs/radardados.ativos.com/
├── .next/                   # Build do Next.js (gerado)
├── logs/                    # Logs do PM2
├── node_modules/            # Dependências
├── public/                  # Assets estáticos
├── src/                     # Código fonte
│   ├── app/                # Pages (App Router)
│   │   ├── dashboard/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── components/         # Componentes React
│   ├── contexts/           # Context API
│   └── lib/                # Utilitários
├── .env.production         # Variáveis de ambiente (NÃO versionar)
├── ecosystem.config.js     # Config PM2
├── package.json
└── deploy.sh              # Script de deploy
```

---

## 🔑 Variáveis de Ambiente

### Back-end (.env)
```env
# Database
DATABASE_URL="mysql://radar_user:SENHA@localhost:3306/radar_production"

# JWT
JWT_SECRET="chave-secreta-64-caracteres-minimo"

# Server
PORT=3030
NODE_ENV=production

# CORS
FRONTEND_URL=https://radardados.ativos.com

# API
API_URL=https://radardadosapi.ativos.com
```

### Front-end (.env.production)
```env
NEXT_PUBLIC_API_URL=https://radardadosapi.ativos.com
```

---

## 🔐 Credenciais (Manter Seguro!)

### Banco de Dados
- **User:** `radar_user`
- **Password:** `[DEFINIR SENHA SEGURA]`
- **Database:** `radar_production`

### JWT Secret
- **JWT_SECRET:** `[GERAR CHAVE ALEATÓRIA 64+ CHARS]`

### Usuário Admin Padrão (Seed)
- **Email:** `admin@radar.com`
- **Password:** `admin123` (ALTERAR IMEDIATAMENTE!)
- **Role:** ADMIN

---

## 🚀 Comandos de Deploy

### Primeiro Deploy
```bash
# Back-end
cd /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com
cp .env.production.example .env
nano .env  # Configurar variáveis
npm install --production
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
npm run build
mkdir -p logs
chmod +x deploy.sh
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Front-end
cd /home/ativos-radardados/htdocs/radardados.ativos.com
cp env.production.template .env.production
npm install --production
npm run build
mkdir -p logs
chmod +x deploy.sh
pm2 start ecosystem.config.js
pm2 save
```

### Atualizações
```bash
# Back-end
cd /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com
git pull
./deploy.sh

# Front-end
cd /home/ativos-radardados/htdocs/radardados.ativos.com
git pull
./deploy.sh
```

---

## 📊 Endpoints da API

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/register` - Registro (apenas ADMIN)
- `GET /auth/me` - Dados do usuário logado

### Usuários
- `GET /users` - Listar usuários
- `GET /users/:id` - Buscar usuário
- `POST /users` - Criar usuário
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário

### Entes
- `GET /entes` - Listar entes
- `GET /entes/:id` - Buscar ente
- `POST /entes` - Criar ente
- `PATCH /entes/:id` - Atualizar ente
- `DELETE /entes/:id` - Deletar ente

### Precatórios
- `GET /precatorios` - Listar precatórios
- `GET /precatorios/:id` - Buscar precatório
- `POST /precatorios` - Criar precatório
- `PATCH /precatorios/:id` - Atualizar precatório
- `DELETE /precatorios/:id` - Deletar precatório
- `POST /precatorios/import` - Importar planilha

### RCL
- `GET /rcl` - Listar RCL
- `GET /rcl/:id` - Buscar RCL
- `POST /rcl` - Criar RCL
- `PATCH /rcl/:id` - Atualizar RCL
- `DELETE /rcl/:id` - Deletar RCL

### Aportes
- `GET /aportes` - Listar aportes
- `GET /aportes/ente/:id` - Buscar aportes por ente (pai + filhos)
- `POST /aportes` - Criar aportes
- `PATCH /aportes/:id` - Atualizar aporte
- `DELETE /aportes/:id` - Deletar aporte

### WebSocket (Notificações)
- `ws://localhost:3030/socket.io` - WebSocket para notificações em tempo real

---

## 🔒 Roles e Permissões

### ADMIN
- Acesso total ao sistema
- Gerenciar usuários
- Importar/Exportar dados
- Configurações do sistema

### OPERADOR
- Cadastrar/Editar precatórios
- Cadastrar/Editar entes
- Cadastrar/Editar RCL
- Cadastrar/Editar aportes
- Visualizar relatórios

### VISUALIZADOR
- Apenas visualização
- Não pode editar
- Pode exportar relatórios

---

## 📦 Dependências Principais

### Back-end
- **NestJS** 11.x - Framework
- **Prisma** 6.x - ORM
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **Socket.io** - WebSocket
- **Bcrypt** - Criptografia de senhas
- **XLSX** - Manipulação de planilhas

### Front-end
- **Next.js** 16.x - Framework React
- **React** 19.x - UI Library
- **TypeScript** 5.x - Tipagem
- **Tailwind CSS** 4.x - Estilização
- **Lucide React** - Ícones
- **Socket.io Client** - WebSocket

---

## 🔄 Processo de Backup

### Automático (Recomendado)
```bash
# Criar script de backup automático
sudo nano /etc/cron.daily/radar-backup

# Conteúdo:
#!/bin/bash
BACKUP_DIR="/home/backups/radar"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mysqldump -u radar_user -p'SENHA' radar_production | gzip > $BACKUP_DIR/db_$DATE.sql.gz
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

# Dar permissão
sudo chmod +x /etc/cron.daily/radar-backup
```

### Manual
```bash
# Backup do banco
mysqldump -u radar_user -p radar_production | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup dos arquivos
tar -czf radar_files_$(date +%Y%m%d).tar.gz \
  /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com \
  /home/ativos-radardados/htdocs/radardados.ativos.com
```

---

## 🔍 Monitoramento

### Logs
```bash
# PM2
pm2 logs radar-api
pm2 logs radar-frontend

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MySQL
sudo tail -f /var/log/mysql/error.log
```

### Status
```bash
# Aplicações
pm2 status

# Recursos
pm2 monit

# Disco
df -h

# Memória
free -h
```

---

## 📞 Suporte

### Logs de Erro
Sempre incluir ao reportar problemas:
```bash
pm2 logs radar-api --lines 100 > error_log.txt
pm2 logs radar-frontend --lines 100 >> error_log.txt
```

### Informações do Sistema
```bash
# Versões
node -v
npm -v
pm2 -v
mysql --version

# Status
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql
```

---

**Última atualização:** 24/11/2024
**Versão do Sistema:** 1.0.0
