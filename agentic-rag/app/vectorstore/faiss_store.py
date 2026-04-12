"""
faiss_store.py

Purpose:
--------
Manages user-isolated FAISS vector stores.
Ensures each user's data is stored in a separate directory to prevent data leakage.
"""

import os
from pathlib import Path
from loguru import logger
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

from app.vectorstore.embeddings import get_embeddings
from app.core.config import settings


class FAISSManager:
    """
    Manager for user-specific FAISS indices.
    """

    def __init__(self):
        self.base_path = Path(settings.FAISS_INDEX_PATH)
        self.embeddings = get_embeddings()

    def _get_user_path(self, user_id: str) -> str:
        """Get the absolute path to a user's FAISS index."""
        user_path = self.base_path / user_id
        user_path.mkdir(parents=True, exist_ok=True)
        return str(user_path)

    def add_documents(self, user_id: str, documents: list[Document]) -> int:
        """
        Add documents to a user's FAISS index.
        Creates a new index if one doesn't exist.
        """
        path = self._get_user_path(user_id)
        index_file = Path(path) / "index.faiss"

        try:
            if index_file.exists():
                # Load and merge
                vectorstore = FAISS.load_local(
                    path, self.embeddings, allow_dangerous_deserialization=True
                )
                vectorstore.add_documents(documents)
            else:
                # Create new
                vectorstore = FAISS.from_documents(documents, self.embeddings)

            vectorstore.save_local(path)
            return len(documents)
        except Exception as e:
            logger.error(f"Failed to add documents for user {user_id}: {str(e)}")
            raise

    def load_index(self, user_id: str) -> FAISS:
        """
        Load a user's FAISS index.
        Returns None if no index exists.
        """
        path = self._get_user_path(user_id)
        index_file = Path(path) / "index.faiss"

        if not index_file.exists():
            return None

        return FAISS.load_local(
            path, self.embeddings, allow_dangerous_deserialization=True
        )

    def delete_index(self, user_id: str) -> bool:
        """Delete a user's FAISS index directory."""
        path = Path(self._get_user_path(user_id))
        if path.exists():
            import shutil
            shutil.rmtree(path)
            return True
        return False