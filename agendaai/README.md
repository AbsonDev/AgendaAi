# AgendaAi - Gerenciador de Filas Online

Uma plataforma SaaS para gerenciamento de filas e atendimentos.

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 14 com TypeScript
- **Estilização**: Tailwind CSS
- **Backend**: API Routes do Next.js
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT com cookies httpOnly
- **Criptografia**: bcrypt para senhas

## 🏗️ Estrutura do Projeto

```
agendaai/
├── src/
│   ├── app/
│   │   ├── api/auth/          # Rotas de autenticação
│   │   ├── dashboard/         # Painel administrativo
│   │   ├── login/             # Página de login
│   │   ├── signup/            # Página de cadastro
│   │   └── page.tsx           # Landing page
│   ├── lib/
│   │   ├── auth.ts           # Utilitários de autenticação
│   │   └── prisma.ts         # Cliente Prisma
│   └── middleware.ts         # Middleware de autenticação
├── prisma/
│   └── schema.prisma         # Schema do banco de dados
└── README.md
```

## 🗄️ Modelos de Dados

### Company
- `id`: Identificador único (cuid)
- `name`: Nome da empresa
- `users`: Relação com usuários
- `queues`: Relação com filas
- `createdAt`: Data de criação

### User
- `id`: Identificador único (cuid)
- `email`: Email único do usuário
- `password`: Senha criptografada (bcrypt)
- `companyId`: Referência para a empresa
- `createdAt`: Data de criação

### Queue
- `id`: Identificador único (cuid)
- `name`: Nome da fila
- `prefix`: Prefixo da fila (A, B, P, etc.)
- `companyId`: Referência para a empresa
- `createdAt`: Data de criação

## 🔧 Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd agendaai
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/agendaai"
JWT_SECRET="sua-chave-secreta-jwt"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-nextauth"
```

5. Execute as migrações do banco:
```bash
npx prisma migrate dev
```

6. Gere o cliente Prisma:
```bash
npx prisma generate
```

7. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🌟 Funcionalidades Implementadas

### ✅ Autenticação
- [x] Cadastro de novas empresas
- [x] Login com email e senha
- [x] Logout
- [x] Proteção de rotas com middleware
- [x] Tokens JWT seguros com cookies httpOnly

### ✅ Páginas
- [x] Landing page com apresentação
- [x] Página de cadastro
- [x] Página de login
- [x] Dashboard básico com boas-vindas

### ✅ Segurança
- [x] Senhas criptografadas com bcrypt
- [x] Cookies httpOnly para tokens
- [x] Middleware de autenticação
- [x] Validação de dados nos formulários

## 🚀 Próximos Passos

### Funcionalidades Planejadas
- [ ] Gestão de filas
- [ ] Painel de senhas
- [ ] Relatórios e métricas
- [ ] Notificações em tempo real
- [ ] Multi-usuário por empresa
- [ ] Configurações da empresa

## 📦 Scripts Disponíveis

```bash
# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start

# Executar linter
npm run lint

# Executar migrações
npx prisma migrate dev

# Visualizar banco de dados
npx prisma studio
```

## 🔐 Segurança

- Senhas são criptografadas usando bcrypt com salt factor 10
- Tokens JWT com expiração de 7 dias
- Cookies httpOnly para prevenir XSS
- Validação de dados tanto no frontend quanto no backend
- Middleware de autenticação protegendo rotas sensíveis

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📞 Suporte

Para suporte, entre em contato através dos issues do GitHub.

---

**AgendaAi** - Transformando o gerenciamento de filas! 🎯
