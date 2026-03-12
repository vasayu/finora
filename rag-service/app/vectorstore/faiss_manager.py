"""
faiss_manager.py — Per-user FAISS vector store management.

Each user gets an isolated FAISS index stored at:
  {FAISS_STORE_PATH}/{user_id}/index.faiss
  {FAISS_STORE_PATH}/{user_id}/docstore.pkl

User isolation is guaranteed at the storage layer —
a user_id is required for every read and write operation.
"""

import os
import pickle
import logging
from pathlib import Path
from typing import Optional

import faiss
import numpy as np
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class FAISSManager:
    """
    Manages per-user FAISS indexes.
    Thread-safe for read operations; use async locks for concurrent writes.
    """

    EMBEDDING_DIM = 1536  # text-embedding-3-small dimension

    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            openai_api_key=settings.openai_api_key,
        )
        self.base_path = Path(settings.faiss_store_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    def _user_dir(self, user_id: str) -> Path:
        """Return and ensure the user's storage directory exists."""
        user_path = self.base_path / user_id
        user_path.mkdir(parents=True, exist_ok=True)
        return user_path

    def _index_path(self, user_id: str) -> tuple[Path, Path]:
        user_dir = self._user_dir(user_id)
        return user_dir / "index.faiss", user_dir / "docstore.pkl"

    def _load_index(self, user_id: str) -> tuple[Optional[faiss.Index], list[Document]]:
        """Load existing FAISS index and docstore for a user. Returns (None, []) if none exists."""
        index_path, docstore_path = self._index_path(user_id)
        if not index_path.exists() or not docstore_path.exists():
            return None, []
        index = faiss.read_index(str(index_path))
        with open(docstore_path, "rb") as f:
            docstore = pickle.load(f)
        return index, docstore

    def _save_index(self, user_id: str, index: faiss.Index, docstore: list[Document]):
        """Persist FAISS index and docstore to disk."""
        index_path, docstore_path = self._index_path(user_id)
        faiss.write_index(index, str(index_path))
        with open(docstore_path, "wb") as f:
            pickle.dump(docstore, f)
        logger.info(f"Saved FAISS index for user {user_id}: {len(docstore)} total chunks")

    def add_documents(self, user_id: str, documents: list[Document]) -> int:
        """
        Embed documents and add them to the user's isolated FAISS index.
        Returns the number of chunks added.
        """
        if not documents:
            return 0

        texts = [doc.page_content for doc in documents]
        embeddings_list = self.embeddings.embed_documents(texts)
        vectors = np.array(embeddings_list, dtype=np.float32)

        # Normalise for cosine similarity
        faiss.normalize_L2(vectors)

        index, docstore = self._load_index(user_id)

        if index is None:
            # First time — create a new flat cosine index
            index = faiss.IndexFlatIP(self.EMBEDDING_DIM)

        index.add(vectors)
        docstore.extend(documents)
        self._save_index(user_id, index, docstore)

        logger.info(f"Added {len(documents)} chunks for user {user_id}")
        return len(documents)

    def similarity_search(
        self, user_id: str, query: str, k: int = 5
    ) -> list[Document]:
        """
        Retrieve the top-k most semantically similar document chunks for a user.
        ALWAYS scoped to the given user_id — cannot leak cross-user data.
        """
        index, docstore = self._load_index(user_id)

        if index is None or index.ntotal == 0:
            logger.info(f"No FAISS index found for user {user_id}")
            return []

        query_embedding = self.embeddings.embed_query(query)
        query_vector = np.array([query_embedding], dtype=np.float32)
        faiss.normalize_L2(query_vector)

        actual_k = min(k, index.ntotal)
        scores, indices = index.search(query_vector, actual_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            doc = docstore[idx]
            doc.metadata["similarity_score"] = float(score)
            results.append(doc)

        return results

    def get_index_stats(self, user_id: str) -> dict:
        """Return stats about a user's index (for health checks / admin)."""
        index, docstore = self._load_index(user_id)
        if index is None:
            return {"user_id": user_id, "chunks": 0, "has_index": False}
        return {
            "user_id": user_id,
            "chunks": index.ntotal,
            "has_index": True,
        }

    def delete_user_index(self, user_id: str) -> bool:
        """
        Hard-delete a user's FAISS index from disk.
        Used when a user deletes their account or all documents.
        """
        index_path, docstore_path = self._index_path(user_id)
        deleted = False
        for path in [index_path, docstore_path]:
            if path.exists():
                path.unlink()
                deleted = True
        logger.warning(f"Deleted FAISS index for user {user_id}")
        return deleted
