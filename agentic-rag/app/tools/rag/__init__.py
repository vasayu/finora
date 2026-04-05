"""
rag/__init__.py — RAG tools registry.
"""

from app.tools.rag.search_docs import search_docs_tool

RAG_TOOLS = [
    search_docs_tool,
]
