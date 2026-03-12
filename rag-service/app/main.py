"""
main.py — FastAPI application entry point for the Finora RAG microservice.

Runs on port 8000. Communicates with the Express backend (port 5000) via HTTP.
"""

import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes.chat import router as chat_router
from app.routes.ingest import router as ingest_router

# ─── Logging setup ───────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


# ─── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle hook."""
    settings = get_settings()

    # Ensure FAISS data directory exists on startup
    faiss_path = Path(settings.faiss_store_path)
    faiss_path.mkdir(parents=True, exist_ok=True)
    logger.info(f"✅ FAISS store path ready: {faiss_path.resolve()}")
    logger.info("🚀 Finora RAG Service started")

    yield  # Application runs here

    logger.info("🛑 Finora RAG Service shutting down")


# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Finora RAG Service",
    description="Agentic RAG microservice powered by LangChain, LangGraph, and FAISS",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Allow requests from the Express backend and Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───────────────────────────────────────────────────────────────────
app.include_router(chat_router, tags=["Chat"])
app.include_router(ingest_router, tags=["Ingestion"])


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for uptime monitoring."""
    return {"status": "ok", "service": "finora-rag"}


# ─── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level="info",
    )
