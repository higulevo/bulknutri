# SupleControl — Sistema de Gestão de Suplementos

Sistema fullstack completo para controle de estoque, vendas e financeiro de loja de suplementos.

## Stack

- **Frontend**: React + Vite + TailwindCSS + Recharts
- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite via Prisma ORM
- **Auth**: JWT
- **Upload**: Multer (armazenamento local)

## Funcionalidades

- ✅ Login com JWT (sessão de 7 dias)
- ✅ Dashboard com gráficos e métricas
- ✅ Cadastro de produtos com variantes/sabores
- ✅ Upload de imagens dos produtos
- ✅ Controle de estoque por variante
- ✅ Entrada de estoque com histórico
- ✅ Venda com carrinho (múltiplos itens)
- ✅ Métodos: PIX, Dinheiro, Cartão, Fiado
- ✅ Pagamentos pendentes com alerta de atraso
- ✅ Histórico de movimentações com reversão
- ✅ Interface responsiva (mobile-first)
- ✅ Alertas de estoque baixo / sem estoque

## Instalação

### Pré-requisitos

- Node.js 18 ou superior
- npm

### 1. Instalar dependências

```bash
# Na pasta raiz do projeto
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configurar banco de dados

```bash
cd backend

# Criar o banco e tabelas
npx prisma db push

# Popular com dados de exemplo
node src/seed.js
```

### 3. Iniciar o sistema

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Rodará em http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Rodará em http://localhost:5173
```

### 4. Acessar

Abra o navegador em: **http://localhost:5173**

## Usuários Padrão

| Usuário  | Senha      | Nome             |
|----------|------------|------------------|
| admin    | admin123   | Administrador    |
| socio1   | socio123   | João Silva       |
| socio2   | socio123   | Pedro Costa      |

## Variáveis de Ambiente

Arquivo: `backend/.env`

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="suplementos_secret_key_2024_muito_seguro"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

## Estrutura de Pastas

```
suplementos/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Schema do banco
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── categories.js
│   │   │   ├── products.js
│   │   │   ├── variants.js
│   │   │   ├── sales.js
│   │   │   ├── movements.js
│   │   │   └── dashboard.js
│   │   ├── utils/
│   │   │   └── prisma.js
│   │   ├── index.js            # Entry point
│   │   └── seed.js             # Dados de exemplo
│   ├── uploads/                # Imagens (criado automaticamente)
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── Layout.jsx  # Sidebar + mobile header
    │   │   └── ui/
    │   │       └── index.jsx   # Modal, Badge, StatCard, etc.
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Products.jsx    # CRUD com variantes
    │   │   ├── Sales.jsx       # Venda com carrinho
    │   │   ├── StockEntry.jsx  # Entrada de estoque
    │   │   ├── Pending.jsx     # Pagamentos pendentes
    │   │   └── Movements.jsx   # Histórico
    │   ├── utils/
    │   │   └── api.js          # Axios com interceptors
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## API Endpoints

### Auth
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Usuário atual

### Produtos
- `GET /api/products` — Listar (filtros: search, categoryId, active)
- `POST /api/products` — Criar (multipart/form-data)
- `PUT /api/products/:id` — Editar
- `DELETE /api/products/:id` — Desativar

### Variantes
- `POST /api/variants` — Criar variante
- `PUT /api/variants/:id` — Editar
- `DELETE /api/variants/:id` — Desativar
- `POST /api/variants/:id/entry` — Entrada de estoque

### Vendas
- `GET /api/sales` — Listar (filtros: status, method, search, page)
- `GET /api/sales/pending` — Pendentes
- `POST /api/sales` — Registrar venda (baixa estoque automaticamente)
- `PUT /api/sales/:id/pay` — Marcar como pago
- `DELETE /api/sales/:id` — Excluir (restaura estoque)

### Movimentações
- `GET /api/movements` — Listar (filtros: type, page)
- `DELETE /api/movements/:id/revert` — Reverter (atualiza estoque)
- `DELETE /api/movements/:id` — Excluir registro

### Dashboard
- `GET /api/dashboard` — Métricas, gráficos, top vendidos

### Categorias
- `GET /api/categories`
- `POST /api/categories`
- `DELETE /api/categories/:id`

## Dicas de Uso

- **Mobile**: A sidebar aparece como menu hambúrguer no celular
- **Carrinho**: Na tela de Vendas, selecione produtos/variantes para adicionar ao carrinho
- **Fiado**: Vendas com método "Fiado" são automaticamente marcadas como pendentes
- **Estorno**: Ao excluir uma venda, o estoque é restaurado automaticamente
- **Reversão**: No histórico de movimentações, entradas podem ser revertidas
