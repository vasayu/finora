"""
pgvector.py

Purpose:
--------
Initializes PGVector vector store.

Why this matters:
-----------------
- Stores embeddings + documents
- Enables similarity search
"""

from langchain_postgres import PGVector

from app.vectorstore.embeddings import get_embeddings
from app.core.config import settings


def get_vectorstore():
    """
    Initialize PGVector store.

    Returns:
        PGVector
    """

    embeddings = get_embeddings()

    return PGVector(
        connection=settings.DATABASE_URL,
        collection_name="documents",
        embedding_function=embeddings,
    )