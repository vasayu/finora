"""
indexing.py

Purpose:
--------
Loads documents and builds FAISS index.

Why this matters:
-----------------
- Without this → RAG returns nothing
- This is how knowledge enters system
"""

from app.vectorstore.faiss_store import create_vectorstore_from_texts


def index_documents(texts: list[str], save_path: str = "faiss_index"):
    """
    Index documents into FAISS.

    Args:
        texts (list[str]): Raw documents
        save_path (str): Path to save index
    """

    # Create vector store
    vectorstore = create_vectorstore_from_texts(texts)

    # Save locally
    vectorstore.save_local(save_path)

    print(f"✅ Indexed {len(texts)} documents")