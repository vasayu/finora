"""
embeddings.py

Purpose:
--------
Provides embedding model for RAG system.

Why this matters:
-----------------
- Converts text into vectors
- Core of semantic search
"""

from langchain_openai import OpenAIEmbeddings


def get_embeddings():
    """
    Initialize embedding model.

    Returns:
        OpenAIEmbeddings
    """

    return OpenAIEmbeddings(
        model="text-embedding-3-small"
    )