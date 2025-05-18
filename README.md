<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Sistema de Autenticação com NestJS

## Descrição

Sistema seguro de autenticação construído com [NestJS](https://github.com/nestjs/nest) utilizando TypeScript. O projeto implementa autenticação de usuários com tokens JWT, controle de acesso baseado em funções (RBAC) usando CASL e gerenciamento seguro de senhas com bcrypt.

## Tecnologias Utilizadas

- **NestJS** - Framework Node.js progressivo para construir aplicações server-side eficientes e escaláveis
- **Prisma ORM** - ORM de próxima geração para Node.js e TypeScript
- **PostgreSQL** - Sistema de banco de dados relacional
- **JWT** (JSON Web Token) - Para autenticação segura
- **CASL** - Framework de autorização isomórfico
- **bcrypt** - Biblioteca para criptografia de senhas

## Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Docker e Docker Compose (para o banco de dados PostgreSQL)

## Como Instalar e Executar

1. **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/nestjs-auth.git
cd nestjs-auth
```

2. **Instale as dependências:**

```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nest-db?schema=public"
JWT_SECRET="seu-segredo-jwt-aqui"
PORT=3000
```

4. **Inicie o banco de dados PostgreSQL:**

```bash
docker-compose up -d
```

5. **Execute as migrações do Prisma:**

```bash
npx prisma migrate dev
```

6. **Inicie o servidor de desenvolvimento:**

```bash
npm run start:dev
# ou
yarn start:dev
```

O servidor estará disponível em `http://localhost:3000`.

## Estrutura do Projeto

```
src/
├── auth/           # Módulo de autenticação
├── users/          # Módulo de usuários
├── posts/          # Módulo de posts
├── casl/           # Configuração de autorização CASL
├── prisma/         # Serviço Prisma para conexão com o banco
└── main.ts         # Ponto de entrada da aplicação
```

## Rotas da API

### Autenticação

- `POST /auth/login` - Login de usuário
  ```json
  {
    "email": "usuario@email.com",
    "password": "senha123"
  }
  ```
  Retorna um token JWT para autenticação.

### Usuários

- `POST /users` - Cria um novo usuário (requer autenticação de admin)
  ```json
  {
    "name": "Nome do Usuário",
    "email": "usuario@email.com",
    "password": "senha123",
    "role": "READER"
  }
  ```

- `GET /users` - Lista todos os usuários (requer autenticação de admin)
- `GET /users/:id` - Obtém detalhes de um usuário específico (requer autenticação de admin)
- `PATCH /users/:id` - Atualiza dados do usuário (requer autenticação de admin)
- `DELETE /users/:id` - Remove um usuário (requer autenticação de admin)

### Posts

- `POST /posts` - Cria um novo post (requer autenticação de writer ou editor)
  ```json
  {
    "title": "Título do Post",
    "content": "Conteúdo do post...",
    "published": true
  }
  ```

- `GET /posts` - Lista todos os posts (requer autenticação de reader, writer ou editor)
- `GET /posts/:id` - Obtém detalhes de um post específico (requer autenticação de reader, writer ou editor)
- `PATCH /posts/:id` - Atualiza um post (requer autenticação de writer ou editor)
- `DELETE /posts/:id` - Remove um post (requer autenticação de admin)

## Sistema de Roles (Funções)

O sistema implementa controle de acesso baseado em funções (RBAC) com as seguintes roles:

- **ADMIN** - Acesso total ao sistema
- **EDITOR** - Pode criar e editar posts
- **WRITER** - Pode criar e editar seus próprios posts
- **READER** - Pode apenas visualizar posts

## Testes

Para executar os testes unitários:

```bash
npm run test
# ou
yarn test
```

Para executar os testes end-to-end:

```bash
npm run test:e2e
# ou
yarn test:e2e
```

## Licença

Este projeto está licenciado sob a licença [MIT](LICENSE).
