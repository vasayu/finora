"""
main.py

Purpose:
--------
Application entry point for agentic-rag FastAPI service.

Fix:
----
- Routers imported AFTER graph is built (prevents circular import)
- graph is a module-level singleton
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.graph.builder import build_graph

app = FastAPI(
    title="Agentic RAG Service",
    description="Multi-agent LangGraph orchestration for Finora",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global graph singleton (built once at startup) ─────────────────
graph = build_graph()

# ── Mount routers (imported after graph to avoid circular deps) ─────
from app.api.chat import router as chat_router
from app.api.hitl import router as hitl_router
from app.api.ingest import router as ingest_router

app.include_router(chat_router)
app.include_router(hitl_router)
app.include_router(ingest_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "agentic-rag"}