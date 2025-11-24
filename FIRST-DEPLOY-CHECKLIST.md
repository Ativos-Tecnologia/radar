# ✅ Checklist - Primeiro Deploy em Produção

## 📋 Pré-requisitos no Servidor

### Sistema
- [ ] Ubuntu/Debian atualizado
- [ ] Node.js 22 LTS instalado
  ```bash
  node -v  # Deve mostrar v22.x.x
  ```
- [ ] NPM atualizado
  ```bash
  npm -v
  ```
- [ ] PM2 instalado globalmente
  ```bash
  npm install -g pm2
  pm2 -v
  ```

### Banco de Dados
- [ ] MySQL instalado e rodando
  ```bash
  sudo systemctl status mysql
  ```
- [ ] Banco de dados criado (`radar_production`)
- [ ] Usuário do banco criado com permissões
- [ ] Testado conexão com o banco
  ```bash
  mysql -u radar_user -p radar_production
  ```

### CloudPanel
- [ ] Domínio `radardadosapi.ativos.com` configurado
- [ ] Domínio `radardados.ativos.com` configurado
- [ ] SSL/HTTPS ativado para ambos
- [ ] Diretórios criados:
  - `/home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com`
  - `/home/ativos-radardados/htdocs/radardados.ativos.com`

---

## 🔧 Back-end (API)

### 1. Upload do Código
- [ ] Código enviado para `/home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com`
- [ ] Estrutura de pastas correta
  ```
  radardadosapi.ativos.com/
  ├── src/
  ├── prisma/
  ├── package.json
  ├── ecosystem.config.js
  └── deploy.sh
  ```

### 2. Configuração
- [ ] Arquivo `.env` criado (copiar de `.env.production.example`)
- [ ] `DATABASE_URL` configurado
  ```env
  DATABASE_URL="mysql://radar_user:SENHA@localhost:3306/radar_production"
  ```
- [ ] `JWT_SECRET` gerado e configurado (64+ caracteres aleatórios)
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] `FRONTEND_URL` configurado
  ```env
  FRONTEND_URL=https://radardados.ativos.com
  ```
- [ ] `PORT` configurado
  ```env
  PORT=3030
  ```
- [ ] `NODE_ENV` configurado
  ```env
  NODE_ENV=production
  ```

### 3. Instalação
- [ ] Dependências instaladas
  ```bash
  npm install --production
  ```
- [ ] Prisma Client gerado
  ```bash
  npm run prisma:generate
  ```
- [ ] Migrations executadas
  ```bash
  npm run prisma:migrate:deploy
  ```
- [ ] Seed executado (opcional, para usuário admin inicial)
  ```bash
  npm run prisma:seed
  ```
- [ ] Build realizado
  ```bash
  npm run build
  ```

### 4. Deploy
- [ ] Diretório `logs/` criado
  ```bash
  mkdir -p logs
  ```
- [ ] Script de deploy com permissão de execução
  ```bash
  chmod +x deploy.sh
  ```
- [ ] PM2 iniciado
  ```bash
  pm2 start ecosystem.config.js
  ```
- [ ] PM2 salvo
  ```bash
  pm2 save
  ```
- [ ] PM2 configurado para iniciar no boot
  ```bash
  pm2 startup
  # Executar o comando que aparecer
  ```

### 5. Nginx/CloudPanel
- [ ] Proxy reverso configurado (porta 3030)
- [ ] WebSocket habilitado para `/socket.io`
- [ ] SSL funcionando
- [ ] Teste de acesso: `https://radardadosapi.ativos.com`

### 6. Verificações
- [ ] Aplicação rodando
  ```bash
  pm2 status
  ```
- [ ] Logs sem erros
  ```bash
  pm2 logs radar-api --lines 50
  ```
- [ ] Endpoint de health check respondendo
  ```bash
  curl https://radardadosapi.ativos.com/
  ```
- [ ] Conexão com banco funcionando

---

## 🎨 Front-end

### 1. Upload do Código
- [ ] Código enviado para `/home/ativos-radardados/htdocs/radardados.ativos.com`
- [ ] Estrutura de pastas correta
  ```
  radardados.ativos.com/
  ├── src/
  ├── public/
  ├── package.json
  ├── ecosystem.config.js
  ├── env.production.template
  └── deploy.sh
  ```

### 2. Configuração
- [ ] Arquivo `.env.production` criado (copiar de `env.production.template`)
- [ ] `NEXT_PUBLIC_API_URL` configurado
  ```env
  NEXT_PUBLIC_API_URL=https://radardadosapi.ativos.com
  ```

### 3. Instalação
- [ ] Dependências instaladas
  ```bash
  npm install --production
  ```
- [ ] Build do Next.js realizado
  ```bash
  npm run build
  ```

### 4. Deploy
- [ ] Diretório `logs/` criado
  ```bash
  mkdir -p logs
  ```
- [ ] Script de deploy com permissão de execução
  ```bash
  chmod +x deploy.sh
  ```
- [ ] PM2 iniciado
  ```bash
  pm2 start ecosystem.config.js
  ```
- [ ] PM2 salvo
  ```bash
  pm2 save
  ```

### 5. Nginx/CloudPanel
- [ ] Proxy reverso configurado (porta 3003)
- [ ] SSL funcionando
- [ ] Cache configurado para assets estáticos
- [ ] Teste de acesso: `https://radardados.ativos.com`

### 6. Verificações
- [ ] Aplicação rodando
  ```bash
  pm2 status
  ```
- [ ] Logs sem erros
  ```bash
  pm2 logs radar-frontend --lines 50
  ```
- [ ] Página inicial carregando
- [ ] Conexão com API funcionando

---

## 🔐 Segurança

### Permissões de Arquivos
- [ ] `.env` com permissão 600
  ```bash
  chmod 600 .env
  ```
- [ ] `.env.production` com permissão 600
  ```bash
  chmod 600 .env.production
  ```

### Firewall
- [ ] Portas 3030 e 3003 bloqueadas externamente (apenas localhost)
- [ ] Apenas portas 80 e 443 abertas publicamente

### Senhas
- [ ] Senha do banco de dados forte e única
- [ ] JWT_SECRET aleatório e seguro (64+ caracteres)
- [ ] Senha do usuário admin alterada após primeiro login

---

## 🧪 Testes Finais

### Back-end
- [ ] API respondendo em `https://radardadosapi.ativos.com`
- [ ] Endpoints protegidos retornando 401 sem token
- [ ] Login funcionando e retornando token JWT
- [ ] WebSocket conectando (notificações)
- [ ] Upload de arquivos funcionando

### Front-end
- [ ] Site carregando em `https://radardados.ativos.com`
- [ ] Login funcionando
- [ ] Dashboard carregando após login
- [ ] Todas as páginas acessíveis
- [ ] Notificações em tempo real funcionando
- [ ] Responsividade mobile OK

### Integração
- [ ] Front-end consegue fazer login no back-end
- [ ] Dados sendo carregados corretamente
- [ ] CORS configurado corretamente
- [ ] Upload de planilhas funcionando
- [ ] Exportação de dados funcionando

---

## 📊 Monitoramento

### PM2
- [ ] `pm2 status` mostrando ambas aplicações online
- [ ] `pm2 monit` funcionando
- [ ] Logs sendo gravados corretamente

### Sistema
- [ ] Uso de CPU aceitável
- [ ] Uso de memória aceitável
- [ ] Disco com espaço suficiente

---

## 📝 Documentação

- [ ] Credenciais documentadas em local seguro
- [ ] Procedimento de backup documentado
- [ ] Contatos de suporte anotados
- [ ] Comandos úteis salvos

---

## 🎯 Primeiro Acesso

1. [ ] Acessar `https://radardados.ativos.com`
2. [ ] Fazer login com usuário admin padrão
3. [ ] **ALTERAR SENHA IMEDIATAMENTE**
4. [ ] Criar outros usuários conforme necessário
5. [ ] Testar todas as funcionalidades principais

---

## ✅ Deploy Concluído!

**Data do deploy:** ___/___/______

**Responsável:** _______________________

**Observações:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🆘 Em Caso de Problemas

### Logs
```bash
# Ver logs do back-end
pm2 logs radar-api --lines 200

# Ver logs do front-end
pm2 logs radar-frontend --lines 200

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### Reiniciar Serviços
```bash
# Reiniciar back-end
pm2 restart radar-api

# Reiniciar front-end
pm2 restart radar-frontend

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Rollback
```bash
# Restaurar backup do .env
cp .env.backup.YYYYMMDD_HHMMSS .env

# Reiniciar aplicação
pm2 restart radar-api
```

---

**📖 Documentação completa:** `DEPLOY.md`
**⚡ Deploy rápido:** `QUICK-DEPLOY.md`
