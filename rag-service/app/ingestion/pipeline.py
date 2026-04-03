"""
pipeline.py — Document ingestion pipeline.

Flow: File on disk → Detect type → Load → Split → Embed → Save to FAISS

Called after a document is uploaded and saved to the server/uploads/ directory.
"""

import logging
from pathlib import Path

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, CSVLoader, TextLoader

from app.vectorstore.faiss_manager import FAISSManager

logger = logging.getLogger(__name__)

# Shared FAISSManager instance (stateless, safe to share)
_faiss_manager = FAISSManager()

# Splitter config — 800 char chunks with 150 char overlap for context continuity
_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=150,
    length_function=len,
    separators=["\n\n", "\n", ". ", " ", ""],
)


class PandasExcelLoader:
    def __init__(self, file_path: str):
        self.file_path = file_path

    def load(self) -> list[Document]:
        import pandas as pd
        docs = []
        try:
            excel_data = pd.read_excel(self.file_path, sheet_name=None)
            for sheet_name, df in excel_data.items():
                csv_data = df.to_csv(index=False)
                content = f"Sheet Name: {sheet_name}\n\n{csv_data}"
                docs.append(Document(page_content=content, metadata={"source": self.file_path, "sheet": str(sheet_name)}))
        except Exception as e:
            logger.error(f"Failed to load Excel file {self.file_path}: {e}")
            raise
        return docs


def _get_loader(file_path: str):
    """Select the appropriate LangChain document loader based on file extension."""
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return PyPDFLoader(file_path)
    elif ext in {".xlsx", ".xls"}:
        return PandasExcelLoader(file_path)
    elif ext == ".csv":
        return CSVLoader(file_path)
    elif ext in {".txt", ".md"}:
        return TextLoader(file_path, encoding="utf-8")
    else:
        # Fallback: treat as plain text
        return TextLoader(file_path, encoding="utf-8")


async def ingest_document(
    user_id: str,
    document_id: str,
    file_path: str,
    file_name: str,
    organization_id: str | None = None,
) -> int:
    """
    Main ingestion entry point. Called from the /ingest route.

    1. Load the file using the appropriate loader.
    2. Split into overlapping chunks.
    3. Attach user-scoped metadata to each chunk.
    4. Embed and store in the user's isolated FAISS index.

    Returns the number of chunks indexed.
    """
    logger.info(f"Ingesting document '{file_name}' (id={document_id}) for user {user_id}")

    if not Path(file_path).exists():
        raise FileNotFoundError(f"File not found at path: {file_path}")

    # 1. Load raw documents
    loader = _get_loader(file_path)
    raw_docs: list[Document] = loader.load()

    if not raw_docs:
        logger.warning(f"No content extracted from {file_name}")
        return 0

    # 2. Split into chunks
    chunks = _splitter.split_documents(raw_docs)

    # 3. Attach metadata — user_id scoping happens here
    for chunk in chunks:
        chunk.metadata.update(
            {
                "user_id": user_id,
                "document_id": document_id,
                "file_name": file_name,
                **({"organization_id": organization_id} if organization_id else {}),
            }
        )

    # 4. Embed and store in user's isolated FAISS index
    count = _faiss_manager.add_documents(user_id, chunks)
    logger.info(f"Ingestion complete: {count} chunks indexed for user {user_id}")
    return count
