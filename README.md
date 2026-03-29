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

1. [Overview & Value Proposition](#-overview--value-proposition)
2. [High-Level Architecture](#-high-level-architecture)
3. [Component Deep Dive](#-component-deep-dive)
    - [Frontend (Next.js)](#frontend-nextjs-14)
    - [Backend API (Node.js / Express)](#backend-api-nodejs--express)
    - [AI Microservice (Python / FastAPI)](#ai-microservice-python--fastapi)
4. [Database Schema & Prisma](#-database-schema--prisma)
5. [The RAG Engine (How it works)](#-the-rag-engine)
6. [Directory Structure Explained](#-directory-structure-explained)
7. [API Reference](#-api-reference)
8. [Local Development & Setup Guide](#-local-development--setup-guide)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
    - [Running Prisma Studio](#running-prisma-studio-db-gui)
    - [Starting the Services](#starting-all-services)
9. [Deployment Strategies](#-deployment-strategies)
10. [Troubleshooting Guide](#-troubleshooting-guide)
11. [Contributing](#-contributing)
12. [License](#-license)

---

## 🚀 Overview & Value Proposition

**Finora** is a cutting-edge financial operating system built for privacy, speed, and intelligence. Traditional financial dashboards offer static charts; Finora provides a cinematic, dynamic workspace where an embedded **Retrieval-Augmented Generation (RAG)** Assistant can reason over your live data.

### Core Capabilities:
- **Cinematic UI/UX:** Built with Aceternity UI and Framer Motion for a fluid, god-tier aesthetic.
- **Agentic AI:** The AI doesn't just read uploaded PDFs. It has LangChain tools equipped to dynamically query your PostgreSQL `Transaction` tables in real-time.
- **Absolute Privacy:** User documents are chunked, embedded, and saved into **completely isolated FAISS vector indices**. By design, User A's RAG context can *never* cross-pollinate with User B's.
- **Secure Reverse Proxying:** The client application has zero direct access to the AI. Node.js authenticates every request strictly via JWTs before securely bridging to the internal Python subnet.

---

## 🏗️ High-Level Architecture

The platform relies on a decoupled, service-oriented architecture (SOA) pattern.

```mermaid
graph TD
    Client[Web Browser / Next.js Client] -->|HTTP / JSON| NextAuth[Next.js App Server (UI)]
    NextAuth -->|Proxies / API Calls| Node[Express.js Core API Gateway]
    
    Node -->|Reads/Writes| Postgres[(PostgreSQL Database)]
    Node -->|Proxies AI Requests| FastAPI[Python FastAPI RAG Service]
    
    FastAPI -->|Live Queries via SQLAlchemy| Postgres
    FastAPI -->|Vector Similarity Search| FAISS[(Local FAISS Indices)]
    FastAPI -->|LLM API Calls| OpenAI[OpenAI API]
    
    subgraph Data Layer
        Postgres
        FAISS
    end
```

### Flow Lifecycle (Example: Asking for Recent Transactions)
1. User types in chat: "Analyze my recent transactions."
2. **Next.js** sends POST to `http://localhost:5000/api/v1/rag/chat` with `Bearer <JWT>`.
3. **Express** verifies JWT, extracts the true `user_id` from the token payload (preventing client spoofing).
4. **Express** forwards payload (`user_id`, `message`) to Python `http://127.0.0.1:8000/chat`.
5. **FastAPI (LangGraph)** determines the user is asking about structured data.
6. The AI Agent invokes the `financial_db_query` tool, generating a safe SQL aggregate query via `SQLAlchemy`.
7. **FastAPI** returns the formatted Markdown analysis to **Express**.
8. **Express** forwards the response to **Next.js**, parsing via `react-markdown`.

---

## 🔍 Component Deep Dive

### Frontend (Next.js 14)
Built utilizing the modern App Router (`app/` directory).
- **Framework:** React 18 / Next.js 14
- **Styling:** Tailwind CSS, Aceternity UI, CSS Variables
- **State Management:** React Context API (`AuthProvider`), Session Storage (Chat History)
- **Formatting:** `react-markdown` + `remark-gfm` for elegant prose rendering.

### Backend API (Node.js / Express)
The heart of data validation and security.
- **Framework:** Express + TypeScript
- **ORM:** Prisma Client
- **Authentication:** Dual-token JWT (Access & Refresh), BCrypt for hashing.
- **Routing:** Modular route handlers (`auth.routes.ts`, `rag.routes.ts`). Errors are caught by a custom global error handler mapped to Winston rotating logs.

### AI Microservice (Python / FastAPI)
A lightweight but computationally heavy worker.
- **Framework:** FastAPI / Uvicorn (ASGI)
- **AI Framework:** LangChain / LangGraph
- **Embeddings:** OpenAI `text-embedding-3-small`
- **Vector Store:** FAISS (Facebook AI Similarity Search). Chosen over Pinecone for low-latency, zero-cost local isolation.
- **Data Access:** SQLAlchemy `create_engine` (Lazy initialized to prevent stale DSN bugs).

---

## 🗄️ Database Schema & Prisma

Finora utilizes PostgreSQL mapped comprehensively by Prisma.

### Core Models (`server/prisma/schema.prisma`)

#### 1. `User`
The core identity. Contains `email`, hashed `password`, `role`.
Relations: Can have multiple `Transaction`s, `Document`s, and `Alert`s.

#### 2. `Transaction`
Live financial activity.
- Fields: `amount` (Float), `type` (INCOME/EXPENSE), `category` (String), `date` (DateTime).
- *AI Relevance:* The RAG Engine runs dynamic aggregate statistics on this table.

#### 3. `Document`
Tracks PDFs and financial records uploaded for RAG context.
- Fields: `fileUrl` (Cloudinary or local path), `status` (PENDING, INDEXED, FAILED).
- Once `INDEXED`, its vectors live in FAISS.

#### 4. `FinancialRecord`
Monthly or quarterly aggregate snapshots usually generated by the AI or cron jobs for graphing Assets, Liabilities, and Equity.

---

## 🧠 The RAG Engine

Finora's RAG system is non-trivial. It implements a **ReAct (Reasoning and Acting)** agent.

### 1. Ingestion (`app/ingestion/pipeline.py`)
When a document is uploaded:
1. `PyPDFLoader` parses the raw text.
2. `RecursiveCharacterTextSplitter` chunks the text into 1000-character blocks with 200-char overlap.
3. OpenAI Embeddings represent chunks as floating-point vectors.
4. `FAISSManager` isolates vectors by writing them to `./data/faiss/{user_id}/`.

### 2. Retrieval & Tooling (`app/tools/`)
The LangChain Agent has access to distinct tools:
- `document_search`: Performs similarity search on the FAISS index to answer queries like "What does my Q3 invoice say?"
- `financial_db_query`: Uses pre-defined programmatic SQL queries via SQLAlchemy to answer questions like "How much did I spend on food this month?"

---

## 📂 Directory Structure Explained

```text
finora/
├── app/                        // Next.js Frontend
│   ├── (auth)/                 // Login/Signup route groups
│   ├── (platform)/             // Authenticated Dashboard pages
│   │   ├── ai/                 // The Chatbot UI (page.tsx)
│   │   ├── dashboard/          // Main operational graphs
│   ├── Components/             // Reusable UI components (Aceternity styling)
│   ├── lib/                    // api.ts (Fetch wrappers)
│   └── globals.css             // Tailwind Core directives
│
├── server/                     // Node.js Backend
│   ├── src/
│   │   ├── config/             // Database and env bootstrapping
│   │   ├── controllers/        // Logic for auth, transactions
│   │   ├── middleware/         // JWT Protect, Error Handlers
│   │   ├── modules/            // Domain specific routes
│   │   └── utils/              // JWT generation, catchAsync 
│   ├── prisma/
│   │   └── schema.prisma       // DB Schema definition
│   └── package.json
│
└── rag-service/                // Python AI Module
    ├── app/
    │   ├── agents/             // Core LangGraph execution
    │   ├── ingestion/          // PDF chunking logic
    │   ├── memory/             // PostgresChatMessageHistory
    │   ├── routes/             // FastAPI /chat, /ingest routers
    │   ├── tools/              // Custom LangChain Tool definitions
    │   └── vectorstore/        // FAISS management
    ├── data/                   // Generated FAISS blobs (Gitignored)
    ├── .venv/                  // Python Virtual Env
    ├── requirements.txt
    └── .env                    
```

---

## 🔌 API Reference

### Express Gateway (`localhost:5000`)
*(All endpoints except `/auth` require `Authorization: Bearer <token>`)*

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Creates a new Postgres user. |
| `/api/v1/auth/login` | POST | Returns Access & Refresh JWTs. |
| `/api/v1/rag/chat` | POST | Proxies message & session_id to Python Agent. |
| `/api/v1/transactions` | GET/POST| CRUD operations for the UI ledger. |

### Python RAG Service (`localhost:8000`)
*(Internal network only. Rejects missing user_id fields).*

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Invokes LangGraph Agent. Expects `user_id`, `message`. |
| `/ingest` | POST | Triggers PDF pipeline. Updates FAISS index. |
| `/health` | GET | Diagnostic heartbeat. |

---

## 💻 Local Development & Setup Guide

This section is the definitive guide to running Finora locally. Follow these steps meticulously.

### Prerequisites
1. **Node.js** (v18+) - `node -v`
2. **Python** (3.9 - 3.12) - `python --version`
3. **PostgreSQL** Desktop / Docker container running locally on port `5432`.
4. Git for version control.

### Environment Variables
You must set up `.env` files in **three distinct locations**.

**1. Root Directory (`finora/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

**2. Node.js Backend (`finora/server/.env`)**
```env
NODE_ENV=development
PORT=5000
# IMPORTANT: Prisma requires connection limits or schema designations here sometimes.
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/finora?schema=public

JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=super_secret_refresh_key
JWT_REFRESH_EXPIRES_IN=7d

RAG_SERVICE_URL=http://127.0.0.1:8000
```
*(Optionally include Cloudinary variables here if using cloud file storage).*

**3. Python RAG Service (`finora/rag-service/.env`)**
```env
# CRITICAL: Do NOT use ?schema=public here. psycopg2 rejects it.
# URL encode special characters (e.g. '@' becomes '%40')
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/finora
OPENAI_API_KEY=sk-your-openai-api-key
PORT=8000
```

### 🗃️ Database Setup & Running Prisma Studio (DB GUI)
We use Prisma to sync our Node.js models with PostgreSQL.

Open a terminal and navigate to the backend:
```bash
cd finora/server
npm install
```

Push the schema to your local database:
```bash
npm run prisma:generate
npm run prisma:push
```

#### Running Prisma Studio
Prisma includes a gorgeous, built-in database visualizer. 
To inspect your live data (Users, Transactions, Documents) from your browser:
```bash
cd finora/server
npx prisma studio
```
**Prisma Studio will open on `http://localhost:5555`.**
*Use this GUI to manually verify transaction ingestion, delete users, or observe changes in real-time.*

### 🚀 Starting All Services

You must dedicate **three separate terminal windows** to keep all microservices humming.

#### Terminal 1: Python RAG Service
*Initialize your virtual environment first to isolate dependencies.*
```bash
cd finora/rag-service
python -m venv .venv
source .venv/Scripts/activate  # Windows
# source .venv/bin/activate    # Mac/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
✅ Wait for: `Application startup complete.`

#### Terminal 2: Node.js Express Backend
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
✅ Wait for: `📡 API available at http://localhost:5000/api/v1`

#### Terminal 3: Next.js Frontend
```bash
cd finora
npm run dev
```
✅ Wait for: `Ready in ... ms. Open http://localhost:3000`

---

## 🐳 Running with Docker

The fastest way to get the entire Finora stack up and running is via **Docker Compose**. This will orchestrate the frontend, backend, RAG service, database, and message queue.

### 1. Prerequisite Environment Setup

You need to create three `.env.docker` files by copying the provided examples.

#### Frontend (.env.docker)
```bash
cp .env.docker.example .env.docker
# Open .env.docker and verify NEXT_PUBLIC_API_URL=http://backend:5000
```

#### Backend (server/.env.docker)
```bash
cp server/.env.docker.example server/.env.docker
# Open server/.env.docker and add your OPENAI_API_KEY
```

#### RAG Service (rag-service/.env.docker)
```bash
cp rag-service/.env.docker.example rag-service/.env.docker
# Open rag-service/.env.docker and add your OPENAI_API_KEY
```

### 2. Build and Start Services

From the project root:

```bash
docker compose up --build
```

### 3. Initialize the Database

Once the containers are running (wait for `Application startup complete` in the RAG logs), you need to push the Prisma schema to the database container:

```bash
# In a new terminal
cd server
npx prisma generate
npx prisma db push
```

### 4. Access the Application

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **RAG Service (Internal):** [http://localhost:8000](http://localhost:8000)

---

## ☁️ Deployment Strategies

When moving to production, treating Finora as three distinct services is recommended.

1. **Frontend**: Deploy `finora/` to **Vercel** or **AWS Amplify**. Ensure `NEXT_PUBLIC_API_URL` points to your public Node backend domain.
2. **Backend**: Deploy `finora/server/` to **Render / Heroku / AWS EC2**. Set production environment variables and run `npx prisma migrate deploy` during the build step.
3. **RAG Service**: Wrap the `rag-service` in a **Docker Container** (FastAPI deployments excel in Docker). Deploy to **Google Cloud Run** or **AWS ECS**.
    * *Note on FAISS:* If deploying serverless, local FAISS blob files (`./data/faiss`) are ephemeral and will be wiped. You must mount a persistent EFS volume, or rewrite the vector store logic to use a hosted solution like Pinecone / Weaviate for production.

---

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
