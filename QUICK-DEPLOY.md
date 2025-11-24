# ⚡ Quick Deploy Guide

## 🎯 Deploy Rápido (Resumo)

### 1️⃣ Back-end (API)

```bash
# Acessar diretório
cd /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com

# Copiar e configurar .env
cp .env.production.example .env
nano .env  # Editar com dados reais

# Executar script de deploy
chmod +x deploy.sh
./deploy.sh
```

**Variáveis obrigatórias no .env:**
- `DATABASE_URL` - String de conexão MySQL
- `JWT_SECRET` - Chave secreta (gerar com: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- `FRONTEND_URL` - https://radardados.ativos.com

---

### 2️⃣ Front-end

```bash
# Acessar diretório
cd /home/ativos-radardados/htdocs/radardados.ativos.com

# Copiar e configurar .env.production
cp env.production.template .env.production
# Conteúdo: NEXT_PUBLIC_API_URL=https://radardadosapi.ativos.com

# Executar script de deploy
chmod +x deploy.sh
./deploy.sh
```

---

## 🗄️ Banco de Dados (Primeira vez)

```sql
mysql -u root -p

CREATE DATABASE radar_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'radar_user'@'localhost' IDENTIFIED BY 'senha-segura';
GRANT ALL PRIVILEGES ON radar_production.* TO 'radar_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🔄 Atualizar (Próximos Deploys)

### Back-end
```bash
cd /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com
git pull
./deploy.sh
```

### Front-end
```bash
cd /home/ativos-radardados/htdocs/radardados.ativos.com
git pull
./deploy.sh
```

---

## 📊 Comandos Úteis

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs radar-api
pm2 logs radar-frontend

# Reiniciar
pm2 restart radar-api
pm2 restart radar-frontend

# Monitorar
pm2 monit
```

---

## ✅ Checklist Mínimo

- [ ] Node 22 LTS instalado
- [ ] PM2 instalado globalmente (`npm i -g pm2`)
- [ ] MySQL rodando
- [ ] Banco de dados criado
- [ ] `.env` configurado no back-end
- [ ] `.env.production` configurado no front-end
- [ ] Nginx/CloudPanel configurado para proxy reverso
- [ ] SSL/HTTPS configurado

---

**📖 Documentação completa:** Ver arquivo `DEPLOY.md`
