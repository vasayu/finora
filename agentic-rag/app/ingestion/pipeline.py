"""
pipeline.py

Purpose:
--------
Orchestrates the ingestion of SQL transaction data into the FAISS vector store.
1. Load from DB.
2. Embed using OpenAI.
3. Save to user-isolated FAISS partition.
"""

from loguru import logger
from app.ingestion.loader import load_user_database
from app.vectorstore.faiss_store import FAISSManager


async def ingest_sql_data(user_id: str):
    """
    Load data from multiple SQL entities and index it for a specific user.
    """
    logger.info(f"Starting database ingestion pipeline for user {user_id}")

    try:
        # Load documents
        docs = load_user_database(user_id)
        
        if not docs:
            logger.warning(f"No documents found to ingest for user {user_id}")
            return 0

        # Index documents
        manager = FAISSManager()
        count = manager.add_documents(user_id, docs)
        
        logger.info(f"✅ Ingested {count} documents for user {user_id}")
        return count

    except Exception as e:
        logger.error(f"SQL ingestion pipeline failed for user {user_id}: {str(e)}")
        raise
