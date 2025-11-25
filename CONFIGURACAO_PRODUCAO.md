# 🔧 Configuração de Produção - Correções Aplicadas

## ✅ Correções Realizadas

### 1. URLs Corrigidas
- **Frontend**: Agora usa `https://radardadosapi.ativos.com/api/v1` (com prefixo `/api/v1`)
- **Backend CORS**: Configurado para aceitar requisições de `https://radardados.ativos.com`

### 2. Tratamento de Erros
- Adicionado tratamento para "Failed to fetch" com mensagens claras
- Todas as chamadas de API agora usam a função centralizada `apiRequest`

### 3. CORS Configurado
- Backend agora tem CORS habilitado para desenvolvimento e produção

---

## 📋 Checklist para Produção

### Backend (`/home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com`)

#### 1. Verificar/Criar arquivo `.env`
```bash
cd /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com
nano .env
```

**Conteúdo necessário:**
```env
# Database
DATABASE_URL="mysql://radar_user:SENHA@localhost:3306/radar_production"

# JWT
JWT_SECRET="sua-chave-secreta-64-caracteres-minimo"

# Server
PORT=3030
NODE_ENV=production

# CORS - IMPORTANTE!
FRONTEND_URL=https://radardados.ativos.com
```

#### 2. Reiniciar o backend para aplicar CORS
```bash
pm2 restart radar-api
# ou
pm2 reload radar-api
```

#### 3. Verificar logs
```bash
pm2 logs radar-api --lines 50
```

---

### Frontend (`/home/ativos-radardados/htdocs/radardados.ativos.com`)

#### 1. Verificar/Criar arquivo `.env.production`
```bash
cd /home/ativos-radardados/htdocs/radardados.ativos.com
nano .env.production
```

**Conteúdo necessário:**
```env
NEXT_PUBLIC_API_URL=https://radardadosapi.ativos.com/api/v1
```

⚠️ **IMPORTANTE**: A URL deve incluir `/api/v1` no final!

#### 2. Rebuild do frontend (se necessário)
```bash
npm run build
pm2 restart radar-frontend
```

#### 3. Verificar logs
```bash
pm2 logs radar-frontend --lines 50
```

---

## 🧪 Testes em Produção

### 1. Testar Backend
```bash
# Verificar se está respondendo
curl https://radardadosapi.ativos.com/api/v1/

# Testar CORS (deve retornar headers CORS)
curl -H "Origin: https://radardados.ativos.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://radardadosapi.ativos.com/api/v1/entes
```

### 2. Testar Frontend
1. Acessar: `https://radardados.ativos.com`
2. Tentar fazer login
3. Abrir DevTools (F12) → Console
4. Verificar se não há erros "Failed to fetch"

### 3. Verificar no Browser
1. Abrir DevTools (F12) → Network
2. Tentar fazer uma requisição (ex: login)
3. Verificar:
   - Status da requisição (deve ser 200 ou 401, não "Failed")
   - Headers de resposta devem incluir CORS headers
   - URL da requisição deve ser: `https://radardadosapi.ativos.com/api/v1/...`

---

## 🔍 Troubleshooting

### Erro: "Failed to fetch"
1. ✅ Verificar se `.env.production` tem a URL correta com `/api/v1`
2. ✅ Verificar se backend está rodando: `pm2 status`
3. ✅ Verificar CORS no backend: `FRONTEND_URL` deve ser `https://radardados.ativos.com`
4. ✅ Verificar logs do backend: `pm2 logs radar-api`
5. ✅ Verificar se Nginx está fazendo proxy corretamente

### Erro: CORS bloqueado
1. ✅ Verificar se `FRONTEND_URL` no backend está correto
2. ✅ Reiniciar backend após alterar `.env`
3. ✅ Verificar se Nginx não está bloqueando headers CORS

### Erro: 404 Not Found
1. ✅ Verificar se URL inclui `/api/v1`
2. ✅ Verificar se backend está rodando na porta correta (3030)
3. ✅ Verificar configuração do Nginx proxy

---

## 📝 Resumo das URLs

| Ambiente | Backend | Frontend |
|----------|---------|----------|
| **Produção** | `https://radardadosapi.ativos.com` | `https://radardados.ativos.com` |
| **API URL** | `https://radardadosapi.ativos.com/api/v1` | - |
| **Porta Interna** | `3030` | `3003` |
| **Diretório** | `/home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com` | `/home/ativos-radardados/htdocs/radardados.ativos.com` |

---

## 🚀 Após Configurar

1. ✅ Backend reiniciado com CORS configurado
2. ✅ Frontend com `.env.production` correto
3. ✅ Frontend rebuild (se necessário)
4. ✅ Testar login e requisições
5. ✅ Verificar logs para erros

---

**Última atualização**: Correções aplicadas para resolver "Failed to fetch" em produção


