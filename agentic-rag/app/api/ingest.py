"""
ingest.py

Purpose:
--------
API endpoints for triggering SQL ingestion manually.
Used for initial data population or re-indexing.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from loguru import logger

from app.ingestion.pipeline import ingest_sql_data

router = APIRouter(prefix="/ingest", tags=["Ingestion"])


class IngestRequest(BaseModel):
    user_id: str = Field(..., description="Authenticated user ID to index")


class IngestResponse(BaseModel):
    success: bool
    message: str


@router.post("/sql", response_model=IngestResponse)
async def ingest_sql(request: IngestRequest, background_tasks: BackgroundTasks):
    """
    Trigger SQL data ingestion for the given user.
    """
    logger.info(f"Ingest SQL request for user {request.user_id}")

    try:
        # We can run this in background if it takes too long
        # But for now we'll run it and return
        count = await ingest_sql_data(request.user_id)
        
        return IngestResponse(
            success=True,
            message=f"Successfully indexed {count} transactions for user {request.user_id}"
        )

    except Exception as e:
        logger.error(f"Manual ingestion failed for user {request.user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Data ingestion failed.")
