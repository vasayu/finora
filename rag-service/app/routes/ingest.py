"""
ingest.py — POST /ingest route.

Triggers the document ingestion pipeline for a given file.
Called by the Express backend after a successful document upload.
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.ingestion.pipeline import ingest_document
from app.vectorstore.faiss_manager import FAISSManager

logger = logging.getLogger(__name__)
router = APIRouter()
_faiss_manager = FAISSManager()


class IngestRequest(BaseModel):
    user_id: str = Field(..., description="Authenticated user ID")
    document_id: str = Field(..., description="Prisma document record ID")
    file_path: str = Field(..., description="Absolute path to the uploaded file on disk")
    file_name: str = Field(..., description="Original filename for display in citations")
    organization_id: str | None = Field(None, description="Optional org ID for team documents")


class IngestResponse(BaseModel):
    success: bool
    chunks_indexed: int
    document_id: str


class IndexStatsResponse(BaseModel):
    user_id: str
    chunks: int
    has_index: bool


@router.post("/ingest", response_model=IngestResponse)
async def ingest(request: IngestRequest):
    """
    Ingest a document into the user's isolated FAISS index.

    Steps: Load → Split → Embed → Store in user's FAISS partition.
    Called automatically by Express after a document upload completes.
    """
    logger.info(
        f"Ingest request | user={request.user_id} | doc={request.document_id} | "
        f"file={request.file_name}"
    )

    try:
        count = await ingest_document(
            user_id=request.user_id,
            document_id=request.document_id,
            file_path=request.file_path,
            file_name=request.file_name,
            organization_id=request.organization_id,
        )
        return IngestResponse(
            success=True,
            chunks_indexed=count,
            document_id=request.document_id,
        )

    except FileNotFoundError as e:
        logger.error(f"File not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        logger.error(f"Ingestion failed for doc {request.document_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Document ingestion failed.")


@router.get("/ingest/stats/{user_id}", response_model=IndexStatsResponse)
async def index_stats(user_id: str):
    """Return FAISS index stats for a user (admin / debug endpoint)."""
    stats = _faiss_manager.get_index_stats(user_id)
    return IndexStatsResponse(**stats)


@router.delete("/ingest/{user_id}")
async def delete_user_index(user_id: str):
    """Hard-delete a user's FAISS index (account deletion / data purge)."""
    deleted = _faiss_manager.delete_user_index(user_id)
    return {"success": deleted, "user_id": user_id}
