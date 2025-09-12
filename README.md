<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# 🔐 Sistema de Autenticação NestJS

Sistema completo de autenticação e autorização construído com NestJS, implementando JWT, OAuth 2.0 e controle de acesso baseado em roles (RBAC) com CASL.

## 🎯 Visão Geral

Este projeto demonstra uma implementação robusta de autenticação moderna, integrando múltiplos provedores de identidade e um sistema granular de permissões. Ideal para aplicações que necessitam de controle de acesso sofisticado e flexível.

## 🏗️ Arquitetura e Decisões Técnicas

### Stack Principal

| Tecnologia | Versão | Justificativa |
|------------|--------|---------------|
| **NestJS** | ^10.0.0 | Framework progressivo que oferece estrutura modular, decorators e injeção de dependência nativa |
| **Prisma ORM** | ^5.0.0 | Type-safety completo, migrações automáticas e excelente DX para PostgreSQL |
| **PostgreSQL** | 15+ | Banco relacional robusto com suporte nativo a JSON para permissões customizadas |
| **JWT** | - | Tokens stateless ideais para APIs distribuídas e microserviços |
| **CASL** | ^6.0.0 | Framework de autorização isomórfico que permite regras complexas e condicionais |
| **Passport.js** | ^0.6.0 | Middleware maduro com +500 estratégias de autenticação |

### Decisões de Design

#### 1. **Autenticação Híbrida**
- **Local**: Email/senha com bcrypt para máxima segurança
- **OAuth 2.0**: Google e GitHub para UX moderna
- **Unificação**: Todos os provedores resultam no mesmo modelo de usuário

#### 2. **Autorização em Camadas**
- **Roles**: Sistema base (ADMIN, EDITOR, WRITER, READER)
- **Permissions**: Granularidade por recurso e ação
- **Conditions**: Regras contextuais (ex: "apenas próprios posts")

#### 3. **Configuração por Padrão**
- **Todos usuários = READER**
- **Fácil customização**: Alteração simples no código para roles específicas

## 📁 Estrutura do Projeto

```
src/
├── 🔐 auth/                    # Módulo de autenticação
│   ├── dto/                    # Data Transfer Objects
│   │   ├── login.dto.ts        # Validação de login
│   │   └── register.dto.ts     # Validação de registro público
│   ├── guards/                 # Guards de proteção
│   │   ├── jwt-auth.guard.ts   # Validação JWT
│   │   ├── role.guard.ts       # Verificação de roles
│   │   ├── google-auth.guard.ts # OAuth Google
│   │   └── github-auth.guard.ts # OAuth GitHub
│   ├── strategies/             # Estratégias Passport
│   │   ├── jwt.strategy.ts     # Estratégia JWT
│   │   ├── google.strategy.ts  # OAuth Google
│   │   └── github.strategy.ts  # OAuth GitHub
│   ├── role/                   # Decorators de roles
│   ├── auth.controller.ts      # Endpoints de autenticação
│   ├── auth.service.ts         # Lógica de negócio auth
│   └── auth.module.ts          # Configuração do módulo
├── 👥 users/                   # Módulo de usuários
│   ├── dto/                    # DTOs de usuário
│   ├── users.controller.ts     # CRUD de usuários
│   ├── users.service.ts        # Lógica de negócio
│   └── users.module.ts         # Configuração do módulo
├── 📝 posts/                   # Módulo de posts (exemplo)
│   ├── dto/                    # DTOs de posts
│   ├── posts.controller.ts     # CRUD de posts
│   ├── posts.service.ts        # Lógica de negócio
│   └── posts.module.ts         # Configuração do módulo
├── 🔑 casl/                    # Autorização CASL
│   ├── casl.service.ts         # Definição de abilities
│   └── casl.module.ts          # Configuração CASL
├── 🗄️ prisma/                 # Database
│   ├── prisma.service.ts       # Cliente Prisma
│   └── prisma.module.ts        # Configuração Prisma
├── ⚙️ config/                  # Configurações
│   └── configuration.ts        # Variáveis de ambiente
└── main.ts                     # Bootstrap da aplicação
```

## 🚀 Configuração e Execução

### Pré-requisitos
- Node.js 18+
- Docker & Docker Compose
- Conta Google Cloud (opcional)
- Conta GitHub Developer (opcional)

### 1. Instalação
```bash
git clone <repository-url>
cd nestjs-auth
npm install
```

### 2. Configuração do Ambiente
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nest-db?schema=public"

# JWT
JWT_SECRET="seu-jwt-secret-super-seguro-aqui"
JWT_ACCESS_TOKEN_EXPIRES_IN="2h"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

# GitHub OAuth (opcional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_CALLBACK_URL="http://localhost:3000/auth/github/callback"

# Server
PORT=3000
```

### 3. Database Setup
```bash
docker-compose up -d          # Inicia PostgreSQL
npx prisma migrate dev        # Executa migrações
npx prisma generate          # Gera cliente Prisma
```

### 4. Execução
```bash
npm run start:dev            # Desenvolvimento
npm run build && npm start   # Produção
```

## 🔌 API Endpoints

### 🔐 Autenticação

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| `POST` | `/auth/login` | Login local | ✅ |
| `POST` | `/auth/register` | Registro público | ✅ |
| `GET` | `/auth/google` | OAuth Google | ✅ |
| `GET` | `/auth/github` | OAuth GitHub | ✅ |

### 👥 Usuários (ADMIN apenas)

| Método | Endpoint | Descrição | Role Necessária |
|--------|----------|-----------|-----------------|
| `GET` | `/users` | Listar usuários | READER+ |
| `GET` | `/users/:id` | Buscar usuário | READER+  |
| `PATCH` | `/users/:id` | Atualizar usuário | ADMIN |
| `DELETE` | `/users/:id` | Remover usuário | ADMIN |

### 📝 Posts (Exemplo RBAC)

| Método | Endpoint | Descrição | Role Necessária |
|--------|----------|-----------|-----------------|
| `GET` | `/posts` | Listar posts | READER+ |
| `GET` | `/posts/:id` | Buscar post | READER+ |
| `POST` | `/posts` | Criar post | WRITER+ |
| `PATCH` | `/posts/:id` | Atualizar post | WRITER+ |
| `DELETE` | `/posts/:id` | Remover post | ADMIN |

## 🔑 Sistema de Permissões

### Hierarquia de Roles
```typescript
ADMIN    → Acesso total ao sistema
EDITOR   → Gerencia todos os posts + lê usuários
WRITER   → Gerencia próprios posts + lê usuários
READER   → Visualiza posts públicos + lê usuários
```

### Configuração Atual
> ⚠️ **Importante**: Por padrão, todos os usuários (local e OAuth) são criados como **READER**.

## 🌐 Configuração OAuth

### Google OAuth
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie/selecione projeto
3. "APIs & Services" → "Credentials"
4. "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure:
   - **Type**: Web application
   - **Redirect URI**: `http://localhost:3000/auth/google/callback`

### GitHub OAuth
1. Acesse [GitHub Settings](https://github.com/settings/developers)
2. "New OAuth App"
3. Configure:
   - **Homepage URL**: `http://localhost:3000`
   - **Callback URL**: `http://localhost:3000/auth/github/callback`

## 📚 Documentação Interativa

Acesse `http://localhost:3000/docs` para:
- ✅ Explorar todos os endpoints
- ✅ Testar requisições diretamente
- ✅ Ver schemas e validações
- ✅ Autenticar com JWT
- ✅ Documentação OAuth completa

### Como usar:
1. **Autenticação local**: Use `/auth/login` ou `/auth/register`
2. **OAuth**: Acesse diretamente `/auth/google` ou `/auth/github`
3. **Rotas protegidas**: Clique "Authorize" e cole o JWT token

## 🛡️ Segurança

- ✅ **Senhas**: Hash bcrypt com salt
- ✅ **JWT**: Tokens assinados com secret seguro
- ✅ **Validação**: Class-validator em todos os DTOs
- ✅ **CORS**: Configurado para produção
- ✅ **Rate Limiting**: Implementável via @nestjs/throttler
- ✅ **HTTPS**: Recomendado para produção

## 🧪 Testes

```bash
npm run test              # Testes unitários
npm run test:e2e          # Testes end-to-end
npm run test:cov          # Coverage report
```

## 🚀 Deploy

### Variáveis de Produção
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="super-secret-production-key"
GOOGLE_CLIENT_ID="prod-google-id"
GITHUB_CLIENT_ID="prod-github-id"
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).
