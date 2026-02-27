<div align="center">

<br />

# ⚡ Finora

### *Your money, finally intelligent.*

**A real-time, AI-powered financial operating system for the modern world.**

AI-driven financial assistant · Anomaly alerts · Document intelligence · Real-time dashboards · Stock terminal

<br />

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![OpenAI](https://img.shields.io/badge/GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

<br />

[✨ Live Demo](#) · [📖 Docs](#) · [🐛 Report Bug](#) · [💡 Request Feature](#)

<br />

---

</div>

## 📖 Table of Contents

- [The Story](#-the-story)
- [Features](#-features)
- [Architecture Overview](#-architecture-overview)
- [Frontend Architecture](#-frontend-architecture)
- [Backend Architecture](#-backend-architecture)
- [Database Schema](#-database-schema)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Future Features](#-future-features)
- [Contributing](#-contributing)

---

## 💡 The Story

The idea for Finora was born out of a simple frustration — financial data has always been abundant, but financial understanding has always been scarce. Most people and small businesses sit on months of transaction history, bank statements, and spending patterns without ever extracting a single meaningful insight from them. We kept asking: what if your financial data could actually talk back? What if instead of opening a spreadsheet, you could just ask *"how much did I spend on subscriptions this month?"* and get a real, sourced answer in seconds — pulled from your actual data, not a generic estimate.

The compliance gap made building it non-negotiable. Document analysis today is tedious — buried under walls of data no one processes. We wanted one platform that watched your money continuously, flagged anomalies before they became disasters, extracted intelligence from financial documents automatically, and provided a real-time terminal for market data. Finora is the financial operating system we wished existed.

---

## ✨ Features

### 🤖 AI Financial Assistant
- Ask natural language questions about your finances — *"How much did I spend on groceries in October?"*
- Answers grounded in **your real transaction data and uploaded documents**
- GPT-4o powered analysis with context from your financial history
- Upload financial documents (PDFs, contracts, statements) for AI-driven extraction
- Conversation-style interface for iterative financial queries

### 📊 Financial Dashboard
- **Net worth overview** with income vs expense breakdowns
- **Monthly spending trends** with category-level drill-down
- **Cash flow visualization** — income vs expenses over time
- **Live transaction feed** — recent transactions at a glance
- **Alerts panel** — anomaly and low-balance warnings
- Dark-themed, responsive design with skeleton loading states

### 📈 Stock Terminal
- **Real-time market data** via Lightweight Charts (TradingView)
- Interactive candlestick / line charts
- Integrated into the platform dashboard with sidebar navigation

### 🛡️ Alerts & Anomaly Detection
- Alert types: `LOW_BALANCE`, `ANOMALY`, and custom triggers
- Alerts surfaced in the platform UI with read/unread state
- Background workers process transactions and flag anomalies via RabbitMQ

### 📋 Document Intelligence
- Upload financial documents to Cloudinary
- AI-powered data extraction with status tracking (Pending → Processing → Completed / Failed)
- Extracted data stored as structured JSON for querying
- Document library with search and organization scoping

### 📑 Financial Reports
- **Balance Sheet** — assets, liabilities, equity breakdown
- **Profit & Loss (P&L)** — income vs expense by period
- Per-organization, per-month financial records

### 🏗️ Multi-Organization Support
- Users belong to organizations
- All data (transactions, documents, financials) scoped per organization
- Role-based access: `USER`, `ADMIN`, `SUPER_ADMIN`

### 🔐 Authentication & Security
- JWT access tokens (15 min) + refresh tokens (7 days)
- Password hashing with bcrypt
- Auth middleware on all protected API routes
- Environment variable validation with Zod

### 📝 Audit Trail
- Every significant action logged with actor, entity, and details
- Full audit history per user for compliance review

---

## 🏛️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                              │
│  Next.js 16 · React Three Fiber · GSAP · Framer Motion · Zustand    │
│  AG Grid · Recharts · Lightweight Charts · Lenis                     │
└─────────────────────────────┬────────────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────▼────────────────────────────────────────┐
│                       EXPRESS.JS API SERVER                           │
│          Routes → Middleware → Services → Prisma ORM                  │
│                    /api/v1/* endpoints                                │
└───────┬──────────────┬──────────────┬──────────────┬─────────────────┘
        │              │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐ ┌────▼──────────┐
│ PostgreSQL   │ │   Redis    │ │ RabbitMQ  │ │  Cloudinary   │
│  (Prisma)    │ │  (Cache +  │ │ (Workers) │ │  (Documents)  │
│              │ │   Config)  │ │           │ │               │
└──────────────┘ └────────────┘ └─────┬─────┘ └───────────────┘
                                      │
                                ┌─────▼──────────┐
                                │    Workers      │
                                │  alert.worker   │
                                │  document.worker│
                                │  report.worker  │
                                │  transaction    │
                                │    .worker      │
                                └────────┬────────┘
                                         │
                                   ┌─────▼─────┐
                                   │  OpenAI   │
                                   │  GPT-4o   │
                                   └───────────┘
```

---

## 🖥️ Frontend Architecture

The frontend is a **Next.js 16** application using the **App Router** with Tailwind CSS v4, deployed on Vercel.

### Route Structure

```
app/
├── layout.tsx                          → Root layout (Geist fonts, ThemeProvider, AuthProvider)
├── globals.css                         → Global styles + Tailwind
│
├── (marketing)/                        → Public marketing pages
│   ├── layout.tsx                      → Navbar + Lenis smooth scrolling
│   ├── page.tsx                        → Landing page (Hero, Features, CTA, etc.)
│   ├── about/page.tsx                  → About page
│   └── contact/page.tsx                → Contact page
│
├── (auth)/                             → Authentication pages
│   ├── login/page.tsx                  → Login
│   └── register/page.tsx               → Register
│
└── (platform)/                         → Authenticated dashboard (protected by AuthProvider)
    ├── layout.tsx                      → Sidebar + auth guard
    ├── dashboard/page.tsx              → Main financial overview
    ├── transactions/page.tsx           → Transaction history
    ├── ai/page.tsx                     → AI financial assistant
    ├── alerts/page.tsx                 → Anomaly alerts
    ├── documents/page.tsx              → Document management
    ├── terminal/page.tsx               → Stock market terminal
    ├── profile/page.tsx                → User profile
    └── reports/
        ├── balance-sheet/page.tsx      → Balance sheet report
        └── pnl/page.tsx               → Profit & Loss report
```

### State Management

| Layer | Tool | Responsibility |
|---|---|---|
| Client state | Zustand | Auth session, terminal state, UI preferences |
| API communication | `lib/api.ts` | Thin fetch wrapper with JWT token injection |
| Theme | next-themes | Dark / light mode toggle |

### Landing Page

The marketing landing page features a premium, interactive design:

- **Three.js Hero** — React Three Fiber + Rapier physics-driven 3D scene with interactive elements
- **GSAP ScrollTrigger** — Staggered text reveals, parallax scrolling, pinning effects
- **Framer Motion** — Component enter/exit animations, hover interactions
- **Lenis** — Buttery smooth scroll across all marketing pages
- **Sections** — Hero, Features, Problem/Solution, Product Showcase, Architecture, CTA, Footer

### Key Components

```
Components/
├── Hero.tsx                → Three.js hero with HeroBackground + PhysicsElements
├── HeroBackground.tsx      → WebGL canvas background
├── PhysicsElements.tsx     → Rapier physics-driven floating 3D objects
├── Navbar.tsx              → Responsive navigation with theme toggle
├── Features.tsx            → Feature cards with animations
├── ProblemSolution.tsx     → Problem/solution comparison section
├── ProductShowcase.tsx     → Interactive product demo section
├── Architecture.tsx        → System architecture visualization
├── CTA.tsx                 → Call-to-action with magnetic button
├── Footer.tsx              → Site footer with links
├── Magnetic.tsx            → Magnetic cursor-follow button effect
├── Sidebar.tsx             → Platform dashboard sidebar navigation
├── AuthProvider.tsx        → JWT auth context (login, register, logout)
├── ThemeProvider.tsx        → next-themes wrapper
├── ThemeToggle.tsx          → Dark/light mode toggle
├── SmoothScroll.tsx         → Lenis smooth scroll wrapper
├── About/                  → About page components
├── Contact/                → Contact form components
└── Terminal/               → Stock terminal components (Lightweight Charts)
```

---

## ⚙️ Backend Architecture

The backend is an **Express.js** application written in TypeScript, located in the `server/` directory.

### Request Lifecycle

```
Request
  → helmet (security headers)
  → cors
  → morgan → Winston (structured logging)
  → authenticate (JWT verification via auth.middleware.ts)
  → Route Handler
  → Service Layer
  → Prisma ORM
  → PostgreSQL
  → Response
  → errorHandler (global catch via error.middleware.ts)
```

### Module Structure

The backend is organized into feature modules, each containing its own routes, controllers, and services:

| Module | API Prefix | Responsibility |
|---|---|---|
| `auth` | `/api/v1/auth` | Register, login, JWT token management |
| `users` | `/api/v1/users` | User profile CRUD, role management |
| `organizations` | `/api/v1/organizations` | Organization CRUD, member management |
| `transactions` | `/api/v1/transactions` | Transaction CRUD, filtering, categorization |
| `financials` | `/api/v1/financials` | Financial records, income/expense aggregation |
| `dashboard` | `/api/v1/dashboard` | Aggregated dashboard data, metrics |
| `documents` | `/api/v1/documents` | Document upload (Cloudinary), AI extraction |
| `alerts` | `/api/v1/alerts` | Alert creation, read status, anomaly flags |
| `ai` | `/api/v1/ai` | GPT-4o financial assistant, document analysis |
| `stocks` | `/api/v1/stocks` | Stock market data endpoints |
| `audit` | (internal) | Audit trail logging |

### Background Workers (RabbitMQ)

| Worker | Responsibility |
|---|---|
| `alert.worker.ts` | Process and dispatch anomaly alerts |
| `document.worker.ts` | Async document processing and AI extraction |
| `report.worker.ts` | Generate financial reports in background |
| `transaction.worker.ts` | Transaction analysis and categorization |

### Middleware Stack

| Middleware | Purpose |
|---|---|
| `auth.middleware.ts` | Verify JWT, attach `req.user` with userId and role |
| `error.middleware.ts` | Global error handler, normalize error responses |

### Utilities

| Utility | Purpose |
|---|---|
| `jwt.ts` | JWT signing and verification helpers |
| `logger.ts` | Winston structured logging with daily rotation |
| `catchAsync.ts` | Async error wrapper for route handlers |
| `upload.ts` | Multer + Cloudinary file upload pipeline |

---

## 🗄️ Database Schema

Built with **Prisma ORM** on PostgreSQL. All tables use UUIDs as primary keys.

```sql
User              → id, email, password, firstName, lastName, role, organizationId
Organization      → id, name
Document          → id, fileName, fileUrl, fileType, status, extractedData (JSON),
                    userId, organizationId
Transaction       → id, amount, currency, type (INCOME/EXPENSE), category,
                    date, description, userId, organizationId
FinancialRecord   → id, organizationId, month, year, totalIncome, totalExpense,
                    netProfit, assets, liabilities, equity
Alert             → id, type, message, isRead, userId
AuditTrail        → id, action, entity, entityId, userId, details (JSON)
```

### Enums

| Enum | Values |
|---|---|
| `Role` | `USER`, `ADMIN`, `SUPER_ADMIN` |
| `DocStatus` | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `TxType` | `INCOME`, `EXPENSE` |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 (App Router) | React framework, SSR, routing |
| TypeScript | 5 | Type safety across frontend |
| Tailwind CSS | 4 | Utility-first styling |
| React Three Fiber | 9 | Declarative Three.js for 3D hero scene |
| @react-three/drei | 10 | Three.js helpers and abstractions |
| @react-three/rapier | 2 | Physics engine for 3D interactions |
| Three.js | r183 | WebGL 3D rendering |
| GSAP | 3 + ScrollTrigger | Scroll animations, timeline effects |
| Framer Motion | 12 | Component animations, layout transitions |
| Zustand | 5 | Lightweight client state management |
| AG Grid | 35 | Data grid for transactions and reports |
| Recharts | 3 | Financial charts and visualizations |
| Lightweight Charts | 5 | TradingView-style stock charts |
| Lenis | 1.3 | Smooth scrolling |
| Lucide React | latest | Icon library |
| next-themes | 0.4 | Dark / light mode |
| clsx + tailwind-merge | latest | Conditional class merging |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | JavaScript runtime |
| Express.js | 4 | HTTP server framework |
| TypeScript | 5 | Type safety |
| PostgreSQL | 15 | Primary relational database |
| Prisma | 5 | Type-safe ORM + migrations |
| Redis | 7 | Caching and config |
| RabbitMQ | 3 | Message queue for background workers |
| OpenAI SDK | 4 | GPT-4o for AI assistant + document analysis |
| Cloudinary | 2 | Document and file storage |
| Winston | 3 | Structured logging with daily rotation |
| Zod | 3 | Runtime validation + env var parsing |
| jsonwebtoken | 9 | JWT signing and verification |
| bcryptjs | 2 | Password hashing |
| Helmet | 7 | Security headers |
| Morgan | 1 | HTTP request logging |
| Multer | 1.4 | Multipart file upload handling |

---

## 📁 Project Structure

```
finora/
├── app/                                # Next.js 16 App Router
│   ├── layout.tsx                      # Root layout (fonts, providers)
│   ├── globals.css                     # Global styles + Tailwind v4
│   ├── (marketing)/                    # Public pages (landing, about, contact)
│   ├── (auth)/                         # Login + Register
│   └── (platform)/                     # Authenticated dashboard pages
│
├── Components/                         # React components
│   ├── Hero.tsx, Features.tsx, ...     # Landing page sections
│   ├── Sidebar.tsx                     # Dashboard navigation
│   ├── AuthProvider.tsx                # JWT auth context
│   ├── About/                          # About page components
│   ├── Contact/                        # Contact form components
│   └── Terminal/                       # Stock terminal components
│
├── lib/                                # Utilities
│   ├── api.ts                          # Fetch wrapper with JWT injection
│   └── store/
│       └── terminalStore.ts            # Zustand store for terminal state
│
├── public/                             # Static assets
│
├── server/                             # Express.js backend
│   ├── src/
│   │   ├── app.ts                      # Express app setup + route mounting
│   │   ├── server.ts                   # HTTP server entry point
│   │   ├── config/                     # DB, Redis, RabbitMQ, Cloudinary, OpenAI, env
│   │   ├── middleware/                 # Auth + error middleware
│   │   ├── modules/                    # Feature modules (auth, users, transactions, etc.)
│   │   ├── workers/                    # RabbitMQ background workers
│   │   ├── utils/                      # JWT, logger, catchAsync, upload
│   │   └── types/                      # TypeScript type definitions
│   ├── prisma/
│   │   └── schema.prisma               # Database schema
│   ├── docker-compose.yml              # Local: PostgreSQL, Redis, RabbitMQ
│   ├── ecosystem.config.js             # PM2 deployment config
│   └── package.json                    # Backend dependencies
│
├── backend/                            # Prisma schema (alternate/migration)
│   └── prisma/
│       └── schema.prisma
│
├── docs/                               # Documentation
├── next.config.ts                      # Next.js configuration
├── tsconfig.json                       # TypeScript config (excludes server/)
├── eslint.config.mjs                   # ESLint configuration
├── postcss.config.mjs                  # PostCSS + Tailwind
└── package.json                        # Frontend dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker + Docker Compose
- npm

### 1. Clone the repository

```bash
git clone https://github.com/vasayu/finora.git
cd finora
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Start local infrastructure

Spin up PostgreSQL, Redis, and RabbitMQ via Docker:

```bash
cd server
docker-compose up -d
```

### 5. Configure environment variables

```bash
cp server/.env.sample server/.env
# Fill in your values (see Environment Variables section below)
```

### 6. Run database migrations

```bash
cd server
npx prisma generate
npx prisma db push
```

### 7. Start the development servers

```bash
# Terminal 1 — Frontend (from project root)
npm run dev

# Terminal 2 — Backend (from server/)
cd server
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000 |
| RabbitMQ Management | http://localhost:15672 |

---

## 🔑 Environment Variables

### `server/.env`

```env
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finora

# JWT
JWT_SECRET=your-256-bit-secret-minimum-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI
OPENAI_API_KEY=sk-...
```

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`. Protected endpoints require a `Bearer <token>` authorization header.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Create user account |
| `POST` | `/api/v1/auth/login` | Login, receive JWT tokens |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Revoke refresh token |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/users/me` | Get current user profile |
| `PATCH` | `/api/v1/users/me` | Update user profile |

### Organizations

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/organizations` | Create organization |
| `GET` | `/api/v1/organizations/:id` | Get organization details |
| `PATCH` | `/api/v1/organizations/:id` | Update organization |

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/transactions` | List transactions (filterable) |
| `POST` | `/api/v1/transactions` | Create transaction |
| `GET` | `/api/v1/transactions/:id` | Get single transaction |
| `PATCH` | `/api/v1/transactions/:id` | Update transaction |

### Financials

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/financials` | Get financial records |
| `POST` | `/api/v1/financials` | Create/update financial record |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard` | Aggregated dashboard metrics |

### Documents

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/documents/upload` | Upload document to Cloudinary |
| `GET` | `/api/v1/documents` | List documents |
| `POST` | `/api/v1/documents/:id/analyze` | Trigger AI analysis |

### Alerts

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/alerts` | List alerts |
| `PATCH` | `/api/v1/alerts/:id` | Mark alert as read |

### AI Assistant

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/ai/chat` | Send message to AI assistant |
| `POST` | `/api/v1/ai/analyze` | AI document analysis |

### Stocks

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/stocks` | Get stock market data |

---

## 🌐 Deployment

### Frontend → Vercel

```bash
# Connect your GitHub repo to Vercel
# Set NEXT_PUBLIC_API_URL in Vercel environment variables
vercel --prod
```

### Backend → Railway / PM2

```bash
# Build the backend
cd server
npm run build

# Start with PM2 (see ecosystem.config.js)
pm2 start ecosystem.config.js

# Or deploy to Railway
railway up
```

### Infrastructure

- **PostgreSQL** — Railway managed Postgres or any hosted provider
- **Redis** — Railway managed Redis or Upstash
- **RabbitMQ** — CloudAMQP or self-hosted via Docker

---

## 🔮 Future Features

### Near-term
- **Real-time WebSocket events** — Live transaction feed and fraud alerts via Socket.io
- **Plaid Integration** — Connect real bank accounts for live transaction syncing
- **Enhanced anomaly detection** — Multi-signal risk scoring with velocity, geo, and amount analysis
- **RAG Pipeline** — Retrieval-augmented generation for document-grounded AI answers

### Mid-term
- **Investment portfolio tracking** — Holdings, P&L, dividends
- **Tax assistant** — Categorize transactions for tax purposes
- **Multi-currency support** — Real-time FX rates
- **Mobile app** — React Native sharing the same API

### Long-term
- **Predictive cash flow** — ML-based 30/60/90 day forecasting
- **Automated savings rules** — Rule engine for auto-transfers
- **Voice interface** — Natural language voice queries
- **Open Banking API** — Public API for third-party integrations

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Built with ❤️ · Powered by OpenAI GPT-4o, Prisma, RabbitMQ, and Next.js

**[⬆ Back to top](#-finora)**

</div>
