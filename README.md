# 🎯 Sistema Radar - Gestão de Precatórios

Sistema completo para gestão e controle de precatórios, desenvolvido com **NestJS** (back-end) e **Next.js** (front-end).

---

## 🚀 Status da Implementação

### ✅ Fase 1: Autenticação e Gestão de Usuários (COMPLETO)

**Back-end:**
- ✅ Modelo de dados com Prisma (User + Roles)
- ✅ Autenticação JWT com Passport
- ✅ Guards de autenticação e autorização por roles
- ✅ CRUD completo de usuários (apenas ADMIN)
- ✅ Script de seed para criar admin inicial
- ✅ Validação de dados com class-validator
- ✅ API RESTful versionada (`/api/v1`)

**Front-end:**
- ✅ Tela de login com validação
- ✅ Tema claro/escuro (light/dark mode)
- ✅ Layout do dashboard (sidebar + topbar)
- ✅ Gestão de usuários (lista + criar/editar/excluir)
- ✅ Proteção de rotas por autenticação
- ✅ Contextos de Auth e Theme
- ✅ Design limpo e responsivo

---

## 🛠️ Tecnologias Utilizadas

### Back-end
- **NestJS** - Framework Node.js
- **Prisma ORM** - ORM para MySQL
- **MySQL** - Banco de dados
- **JWT** - Autenticação via tokens
- **Passport** - Estratégias de autenticação
- **bcrypt** - Hash de senhas
- **class-validator** - Validação de DTOs

### Front-end
- **Next.js 15** - Framework React (App Router)
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização
- **Lucide React** - Ícones
- **Context API** - Gerenciamento de estado

---

## 📁 Estrutura do Projeto

```
radar/
├── back-end/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelo do banco de dados
│   │   └── seed.ts                # Script para criar admin inicial
│   ├── src/
│   │   ├── auth/                  # Módulo de autenticação
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/        # JWT Strategy
│   │   │   ├── guards/            # Auth & Roles Guards
│   │   │   └── decorators/        # Roles Decorator
│   │   ├── users/                 # Módulo de usuários
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/               # DTOs de validação
│   │   ├── prisma/                # Módulo do Prisma
│   │   │   ├── prisma.service.ts
│   │   │   └── prisma.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env                       # Variáveis de ambiente
│   └── package.json
│
├── front-end/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/             # Página de login
│   │   │   ├── dashboard/         # Dashboard principal
│   │   │   │   └── usuarios/      # Gestão de usuários
│   │   │   ├── layout.tsx         # Layout raiz
│   │   │   └── page.tsx           # Página inicial
│   │   ├── components/
│   │   │   └── dashboard-layout.tsx  # Layout do dashboard
│   │   ├── contexts/
│   │   │   ├── auth-context.tsx   # Contexto de autenticação
│   │   │   └── theme-context.tsx  # Contexto de tema
│   │   └── lib/
│   │       └── api.ts             # Cliente HTTP
│   ├── .env.local                 # Variáveis de ambiente
│   └── package.json
│
├── SETUP_DEV.md                   # Guia de setup completo
└── README.md                      # Este arquivo
```

---

## 🔐 Perfis de Usuário (Roles)

| Perfil | Descrição | Permissões |
|--------|-----------|------------|
| **ADMIN** | Administrador do sistema | Acesso total, incluindo gestão de usuários |
| **OPERADOR** | Operador de dados | Pode cadastrar/editar dados (futuramente) |
| **VISUALIZADOR** | Apenas visualização | Acesso somente leitura (futuramente) |

---

## 🎨 Funcionalidades Implementadas

### Autenticação
- ✅ Login com email e senha
- ✅ Geração de token JWT
- ✅ Validação de token em todas as rotas protegidas
- ✅ Logout

### Gestão de Usuários (ADMIN)
- ✅ Listar todos os usuários
- ✅ Criar novo usuário
- ✅ Editar usuário existente
- ✅ Excluir usuário
- ✅ Ativar/desativar usuário
- ✅ Definir perfil (role)

### Interface
- ✅ Tema claro/escuro
- ✅ Layout responsivo
- ✅ Sidebar com menu
- ✅ Topbar com perfil do usuário
- ✅ Dashboard com cards de estatísticas
- ✅ Tabela de usuários com ações
- ✅ Modal de criação/edição

---

## 📊 Endpoints da API

### Autenticação
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@radar.com",
  "senha": "admin123"
}
```

### Usuários (requer autenticação + role ADMIN)
```http
GET    /api/v1/users           # Listar todos
GET    /api/v1/users/:id       # Buscar por ID
POST   /api/v1/users           # Criar novo
PATCH  /api/v1/users/:id       # Atualizar
DELETE /api/v1/users/:id       # Excluir
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js 20+
- PostgreSQL instalado
- Git

### Passo a Passo

Consulte o arquivo **[SETUP_DEV.md](./SETUP_DEV.md)** para instruções detalhadas.

**Resumo rápido:**

1. **Configurar o banco de dados**
   - Criar database `radar_dev` no PostgreSQL
   - Configurar credenciais no `.env` do back-end

2. **Back-end**
   ```bash
   cd back-end
   npm install
   npx prisma migrate dev --name init
   npm run prisma:seed
   npm run start:dev
   ```

3. **Front-end**
   ```bash
   cd front-end
   npm install
   npm install lucide-react
   # Criar .env.local com NEXT_PUBLIC_API_URL
   npm run dev
   ```

4. **Acessar**
   - Front-end: http://localhost:3000
   - Back-end: http://localhost:3333
   - Login: `admin@radar.com` / `admin123`

---

## 📝 Próximos Módulos (Roadmap)

### Fase 2: Cadastros Base
- [ ] Módulo de Entes (principais e vinculados)
- [ ] Módulo de Tribunais (TJ, TRT, TRF)
- [ ] Módulo de Regimes
- [ ] Módulo de Contas

### Fase 3: Dados Financeiros
- [ ] Módulo de RCL Anual
- [ ] Módulo de LOA Inscrição
- [ ] Módulo de Saldo de Conta
- [ ] Módulo de Aportes

### Fase 4: Precatórios
- [ ] Cadastro de Precatórios
- [ ] Importação via planilha
- [ ] Módulo de Pagamentos
- [ ] Relatórios e dashboards

### Fase 5: Melhorias
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] Logs de auditoria
- [ ] Notificações
- [ ] API pública com tokens

---

## 🔒 Segurança

- ✅ Senhas criptografadas com bcrypt (salt rounds: 10)
- ✅ Tokens JWT com expiração de 7 dias
- ✅ Validação de dados em todos os endpoints
- ✅ Guards de autenticação e autorização
- ✅ CORS habilitado
- ✅ Variáveis de ambiente para dados sensíveis

---

## 👨‍💻 Desenvolvimento

### Comandos Úteis

**Back-end:**
```bash
npm run start:dev          # Modo desenvolvimento
npm run build              # Build para produção
npm run prisma:generate    # Gerar Prisma Client
npm run prisma:migrate     # Rodar migrations
npm run prisma:seed        # Popular banco
```

**Front-end:**
```bash
npm run dev                # Modo desenvolvimento
npm run build              # Build para produção
npm run start              # Rodar build
```

---

## 🚀 Deploy em Produção

### Documentação de Deploy

Este projeto está preparado para deploy no CloudPanel com Node.js 22 LTS.

**URLs de Produção:**
- **Front-end:** https://radardados.ativos.com (porta 3003)
- **Back-end:** https://radardadosapi.ativos.com (porta 3030)

**Guias de Deploy:**
- 📖 **[DEPLOY.md](./DEPLOY.md)** - Guia completo de deploy
- ⚡ **[QUICK-DEPLOY.md](./QUICK-DEPLOY.md)** - Deploy rápido (resumo)
- ✅ **[FIRST-DEPLOY-CHECKLIST.md](./FIRST-DEPLOY-CHECKLIST.md)** - Checklist do primeiro deploy
- 📋 **[PRODUCTION-INFO.md](./PRODUCTION-INFO.md)** - Informações de produção
- 🔧 **[MAINTENANCE.md](./MAINTENANCE.md)** - Guia de manutenção

**Arquivos de Configuração:**
- `back-end/ecosystem.config.js` - Config PM2 do back-end
- `front-end/ecosystem.config.js` - Config PM2 do front-end
- `back-end/.env.production.example` - Template de variáveis do back-end
- `front-end/env.production.template` - Template de variáveis do front-end
- `nginx-config-example.conf` - Exemplo de configuração Nginx

**Scripts de Deploy:**
- `back-end/deploy.sh` - Script automatizado de deploy do back-end
- `front-end/deploy.sh` - Script automatizado de deploy do front-end

---

## 📄 Licença

Este projeto é proprietário e confidencial.

---

## 📞 Suporte

Para dúvidas ou problemas:
- **Desenvolvimento:** Consulte `SETUP_DEV.md`
- **Produção:** Consulte `MAINTENANCE.md`
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para gestão eficiente de precatórios**
