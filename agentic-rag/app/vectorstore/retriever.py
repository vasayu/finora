"""
retriever.py

Purpose:
--------
Two-stage retrieval logic for RAG system:
1. Similarity search using FAISS (Retrieve top candidates).
2. Reranking using FlashRank (Refine and re-score top candidates).

Automatic On-Demand Ingestion:
If no index exists for a user, it automatically triggers SQL ingestion.
"""

from typing import List
from loguru import logger
from langchain_core.documents import Document
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import FlashrankRerank

from app.vectorstore.faiss_store import FAISSManager
from app.ingestion.pipeline import ingest_sql_data


def get_reranking_retriever(user_id: str):
    """
    Initialize a two-stage retriever for a specific user.
    
    1. Base retriever: FAISS similarity search.
    2. Compressor: FlashRank reranker.
    """
    manager = FAISSManager()
    vectorstore = manager.load_index(user_id)
    
    if not vectorstore:
        # If still None after auto-ingest attempt, return None
        return None

    # Step 1: Base Retriever (Similarity)
    base_retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 10},  # Fetch top 10 for reranking
    )

    # Step 2: Reranker (FlashRank)
    compressor = FlashrankRerank()
    
    # Combined Retriever
    compression_retriever = ContextualCompressionRetriever(
        base_compressor=compressor,
        base_retriever=base_retriever
    )
    
    return compression_retriever


async def retrieve_docs(user_id: str, query: str) -> List[Document]:
    """
    Retrieve and rerank relevant documents for a user's query.
    Automatically triggers ingestion if the user's index is missing.

    Args:
        user_id (str): Isolated user context
        query (str): User natural language query

    Returns:
        List[Document]: Reranked relevant chunks (Top 5)
    """
    logger.info(f"Retrieving docs for user {user_id} with query: {query}")
    
    manager = FAISSManager()
    
    # ─── On-Demand Ingestion ───────────────────────────────────────────
    # Always re-ingest from SQL to ensure fresh data
    # (FAISS is cheap to rebuild from a few hundred transactions)
    logger.info(f"🚀 Auto-ingest triggered for user {user_id}")
    try:
        await ingest_sql_data(user_id)
    except Exception as e:
        logger.error(f"Auto-ingest failed for user {user_id}: {str(e)}")
        # If re-ingest fails and no index exists at all, bail
        if manager.load_index(user_id) is None:
            return []

    retriever = get_reranking_retriever(user_id)
    
    if not retriever:
        logger.warning(f"Retriever could not be initialized for user {user_id}")
        return []

    try:
        # invoke will return the compressed (reranked) docs
        docs = await retriever.ainvoke(query)
        
        # Limit to top 5 after reranking for LLM context window efficiency
        return docs[:5]
    except Exception as e:
        logger.error(f"RAG retrieval failed for user {user_id}: {str(e)}")
        return []