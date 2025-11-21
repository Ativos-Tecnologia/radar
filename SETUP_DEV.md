# 🚀 Setup do Ambiente de Desenvolvimento

Este guia vai te ajudar a configurar e rodar o projeto Radar localmente (back-end + front-end).

---

## 📋 Pré-requisitos

- **Node.js** 20+ instalado
- **MySQL** instalado (MySQL Workbench, phpMyAdmin ou linha de comando)
- **Git** instalado

---

## 1️⃣ Configurar o Banco de Dados (MySQL)

### 1.1. Criar o banco de dados

Abra o **MySQL Workbench** (ou phpMyAdmin, ou linha de comando) e execute:

```sql
CREATE DATABASE radar_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1.2. Anotar as credenciais

Você vai precisar de:
- **Usuário**: (ex: `root` ou seu usuário MySQL)
- **Senha**: (a senha que você configurou no MySQL)
- **Host**: `localhost`
- **Porta**: `3306` (padrão)
- **Database**: `radar_dev`

---

## 2️⃣ Configurar o Back-end

### 2.1. Navegar para a pasta do back-end

```bash
cd "f:\Sistemas\Sistema Radar\radar\back-end"
```

### 2.2. Instalar dependências

```bash
npm install
```

### 2.3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
copy .env.example .env
```

Edite o arquivo `.env` e ajuste as credenciais do banco:

```env
# App
PORT=3333

# Database (MySQL)
DATABASE_URL=mysql://root:SUA_SENHA@localhost:3306/radar_dev

# JWT
JWT_SECRET=minha-chave-secreta-super-segura-123
```

**⚠️ Importante**: Substitua `SUA_SENHA` pela senha real do seu MySQL (e `root` pelo seu usuário, se for diferente).

### 2.4. Rodar migrations do Prisma

Isso vai criar as tabelas no banco:

```bash
npx prisma migrate dev --name init
```

### 2.5. Popular o banco com usuário admin inicial

```bash
npm run prisma:seed
```

Isso vai criar um usuário admin com:
- **Email**: `admin@radar.com`
- **Senha**: `admin123`

⚠️ **Altere a senha após o primeiro login!**

### 2.6. Iniciar o back-end em modo DEV

```bash
npm run start:dev
```

Você deve ver:

```
🚀 Server running on http://localhost:3333
```

---

## 3️⃣ Configurar o Front-end

### 3.1. Abrir outro terminal e navegar para a pasta do front-end

```bash
cd "f:\Sistemas\Sistema Radar\radar\front-end"
```

### 3.2. Instalar dependências

```bash
npm install
```

### 3.3. Configurar variáveis de ambiente

Crie o arquivo `.env.local` na raiz do front-end:

```bash
# Criar o arquivo (Windows)
type nul > .env.local
```

Edite o arquivo `.env.local` e adicione:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1
```

### 3.4. Instalar ícones (Lucide React)

```bash
npm install lucide-react
```

### 3.5. Iniciar o front-end em modo DEV

```bash
npm run dev
```

Você deve ver:

```
✓ Ready in X ms
○ Local: http://localhost:3000
```

---

## 4️⃣ Testar o Sistema

### 4.1. Acessar o front-end

Abra o navegador em: **http://localhost:3000**

### 4.2. Fazer login

Use as credenciais do admin:
- **Email**: `admin@radar.com`
- **Senha**: `admin123`

### 4.3. Testar a API diretamente (opcional)

Você pode testar os endpoints da API usando ferramentas como **Postman** ou **Insomnia**:

#### Login
```http
POST http://localhost:3333/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@radar.com",
  "senha": "admin123"
}
```

Resposta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "nomeCompleto": "Administrador",
    "email": "admin@radar.com",
    "role": "ADMIN",
    ...
  }
}
```

#### Listar usuários (precisa do token)
```http
GET http://localhost:3333/api/v1/users
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 5️⃣ Estrutura de Pastas

```
radar/
├── back-end/
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo do banco
│   │   └── seed.ts          # Script para criar admin inicial
│   ├── src/
│   │   ├── auth/            # Módulo de autenticação (JWT)
│   │   ├── users/           # Módulo de usuários (CRUD)
│   │   ├── prisma/          # Serviço do Prisma
│   │   └── main.ts          # Entrada da aplicação
│   └── .env                 # Variáveis de ambiente
│
└── front-end/
    ├── src/
    │   ├── app/             # Rotas do Next.js
    │   ├── components/      # Componentes reutilizáveis
    │   └── lib/             # Utilitários
    └── package.json
```

---

## 6️⃣ Endpoints Disponíveis

### Autenticação
- `POST /api/v1/auth/login` - Login (público)

### Usuários (apenas ADMIN)
- `GET /api/v1/users` - Listar todos os usuários
- `GET /api/v1/users/:id` - Buscar usuário por ID
- `POST /api/v1/users` - Criar novo usuário
- `PATCH /api/v1/users/:id` - Atualizar usuário
- `DELETE /api/v1/users/:id` - Remover usuário

---

## 7️⃣ Perfis de Usuário (Roles)

- **ADMIN**: Acesso total, pode gerenciar usuários
- **OPERADOR**: Pode cadastrar/editar dados (futuramente)
- **VISUALIZADOR**: Apenas visualização (futuramente)

---

## 8️⃣ Comandos Úteis

### Back-end
```bash
npm run start:dev          # Iniciar em modo desenvolvimento
npm run build              # Build para produção
npm run prisma:generate    # Gerar Prisma Client
npm run prisma:migrate     # Rodar migrations
npm run prisma:seed        # Popular banco com dados iniciais
```

### Front-end
```bash
npm run dev                # Iniciar em modo desenvolvimento
npm run build              # Build para produção
npm run start              # Rodar build de produção
```

---

## 🐛 Problemas Comuns

### Erro de conexão com o banco
- Verifique se o PostgreSQL está rodando
- Confira as credenciais no arquivo `.env`
- Teste a conexão no PGAdmin

### Porta já em uso
- Back-end (3333): Mude a porta no `.env`
- Front-end (3000): Mude no `package.json` ou mate o processo

### Erro ao rodar migrations
```bash
npx prisma migrate reset    # ⚠️ Isso vai apagar todos os dados!
npx prisma migrate dev --name init
npm run prisma:seed
```

---

## ✅ Próximos Passos

Agora que o sistema está rodando, você pode:

1. Fazer login como admin
2. Criar novos usuários
3. Testar os perfis (ADMIN, OPERADOR, VISUALIZADOR)
4. Aguardar a implementação dos próximos módulos:
   - Entes
   - Tribunais
   - RCL
   - Precatórios
   - etc.

---

**Qualquer dúvida, me avise!** 🚀
