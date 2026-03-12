<div align="center">
  <img src="https://via.placeholder.com/200x200.png?text=Finora" alt="Finora Logo" width="150" />
  <h1>FINORA</h1>
  <p><strong>The Enterprise Financial Operating System with embedded AI Intelligence</strong></p>
  
  
  <p>
    <a href="#overview"><img src="https://img.shields.io/badge/Status-Active-brightgreen.svg" alt="Status" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Tech-Next.js%20%7C%20Node%20%7C%20Python-blue.svg" alt="Tech Stack" /></a>
    <a href="#license"><img src="https://img.shields.io/badge/License-MIT-purple.svg" alt="License" /></a>
  </p>
</div>

<hr />

## 📖 Table of Contents

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
cd finora/server
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

## ☁️ Deployment Strategies

When moving to production, treating Finora as three distinct services is recommended.

1. **Frontend**: Deploy `finora/` to **Vercel** or **AWS Amplify**. Ensure `NEXT_PUBLIC_API_URL` points to your public Node backend domain.
2. **Backend**: Deploy `finora/server/` to **Render / Heroku / AWS EC2**. Set production environment variables and run `npx prisma migrate deploy` during the build step.
3. **RAG Service**: Wrap the `rag-service` in a **Docker Container** (FastAPI deployments excel in Docker). Deploy to **Google Cloud Run** or **AWS ECS**.
    * *Note on FAISS:* If deploying serverless, local FAISS blob files (`./data/faiss`) are ephemeral and will be wiped. You must mount a persistent EFS volume, or rewrite the vector store logic to use a hosted solution like Pinecone / Weaviate for production.

---

## 🐛 Troubleshooting Guide

**1. "RAG Service Unavailable (502 Gateway)" in Frontend Chat**
- **Cause:** Express cannot reach FastAPI, or FastAPI crashed.
- **Fix:** Ensure Terminal 1 (Python) is running without traceback errors. Ensure `RAG_SERVICE_URL` in `server/.env` is strictly `http://127.0.0.1:8000` (Node native `fetch` can sometimes fail on `localhost` IPv6 resolution).

**2. "invalid dsn: invalid connection option schema"**
- **Cause:** You pasted your Prisma `DATABASE_URL` (which contains `?schema=public`) into the Python `.env`. 
- **Fix:** Remove `?schema=public` from `rag-service/.env`. Also ensure any `@` symbols in your database password are URL-encoded as `%40` for psycopg2 compatibility.

**3. "Authentication Failed" when opening Dashboard**
- **Cause:** JWT Secret mismatch or expired token.
- **Fix:** Completely clear your browser's `localStorage` and `sessionStorage`, or hit the "Logout" button, and log in again. Ensure `JWT_SECRET` is identical across restarts.

**4. Prisma errors on `prisma:push`**
- **Cause:** Connection string is bad or Postgres service isn't running.
- **Fix:** Verify Postgres is running on port 5432 using `pg_isready` (Linux) or Windows Services.

---

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ by financial technologists.</sub>
</div>
