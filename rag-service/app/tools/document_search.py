"""
document_search.py — LangChain tool: semantic search over a user's FAISS index.

The user_id is injected into the tool at construction time via a closure.
The LLM agent CANNOT change the user_id — it only provides the search query.
This is the primary security boundary for per-user data isolation.
"""

import logging
from langchain_core.tools import tool

from app.vectorstore.faiss_manager import FAISSManager

logger = logging.getLogger(__name__)


def make_document_search_tool(user_id: str, faiss_manager: FAISSManager):
    """
    Factory function that returns a document search tool scoped to a specific user.
    The user_id is captured in the closure — the LLM only controls the `query`.
    """

    @tool
    def document_search(query: str) -> str:
        """
        Search the user's uploaded financial documents for information relevant
        to the given query. Use this tool whenever the user asks about the content
        of their uploaded files, reports, invoices, or statements.

        Args:
            query: A natural language search query describing what information you need.

        Returns:
            Relevant text excerpts from the user's documents with source metadata.
        """
        logger.info(f"[document_search] user={user_id} query='{query}'")
        results = faiss_manager.similarity_search(user_id=user_id, query=query, k=5)

        if not results:
            return (
                "No relevant documents found. The user may not have uploaded any documents yet, "
                "or the documents don't contain information about this topic."
            )

        formatted_chunks = []
        for i, doc in enumerate(results, 1):
            source = doc.metadata.get("file_name", "Unknown file")
            score = doc.metadata.get("similarity_score", 0.0)
            formatted_chunks.append(
                f"[Source {i}: {source} | Relevance: {score:.2f}]\n{doc.page_content}"
            )

        return "\n\n---\n\n".join(formatted_chunks)

    return document_search
