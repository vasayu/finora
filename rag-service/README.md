# Finora RAG Service

Production-grade Agentic RAG microservice for Finora built with:
- **Python 3.12** (LTS)
- **FastAPI** — async REST API framework
- **LangGraph** — ReAct agent state machine
- **LangChain** — document loaders, splitters, tool orchestration
- **OpenAI Embeddings** — `text-embedding-3-small` (1536 dims)
- **FAISS** — per-user isolated vector store persisted to disk
- **GPT-4o** — the reasoning LLM

---

## Architecture

```
Express Backend (port 5000)
  └── /api/v1/rag/*  ──proxy──► Python RAG Service (port 8000)
                                  ├── LangGraph ReAct Agent
                                  │     ├── Tool: document_search (FAISS)
                                  │     └── Tool: financial_db_query (PostgreSQL)
                                  └── Per-user FAISS indexes (data/faiss/{userId}/)
```

---

## Running Locally

### 1. Create virtual environment
```bash
cd finora/rag-service
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
# Fill in your OPENAI_API_KEY and DATABASE_URL
```

### 4. Start the service
```bash
uvicorn app.main:app --reload --port 8000
```

The service starts at **http://localhost:8000**
Interactive API docs: **http://localhost:8000/docs**

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/chat` | Run agent for one conversation turn |
| `POST` | `/chat/clear` | Clear session history |
| `POST` | `/ingest` | Ingest a document into user's FAISS index |
| `GET`  | `/ingest/stats/{user_id}` | Get index stats for a user |
| `DELETE` | `/ingest/{user_id}` | Delete user's FAISS index |
| `GET`  | `/health` | Health check |

> **Note:** In production, always call these through the Express proxy at `/api/v1/rag/*` — never directly from the frontend. The proxy enforces JWT authentication and injects the correct `user_id`.

---

## User Data Isolation

Every FAISS index is stored at `data/faiss/{userId}/` on disk.
- The `user_id` is always injected into tools at agent-construction time via Python closures.
- The LLM **cannot** override or escape the `user_id` scope.
- Cross-user data retrieval is architecturally impossible.
