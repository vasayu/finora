"""
verify_rag_system.py

Tests the RAG ingestion and retrieval with reranking.
Mocks the SQL database loading to focus on vector store and FlashRank functionality.
"""

import asyncio
import os
import sys
from unittest.mock import patch, MagicMock
from langchain_core.documents import Document

# Add project root to sys.path
sys.path.append(os.getcwd())

from app.ingestion.pipeline import ingest_sql_data
from app.vectorstore.retriever import retrieve_docs
from app.vectorstore.faiss_store import FAISSManager

# Sample mock data
MOCK_USER_ID = "test-user-999"
MOCK_DOCS = [
    Document(
        page_content="On 2024-03-01, an expense of ₹5000 was recorded in Food for lunch with clients.",
        metadata={"date": "2024-03-01", "category": "Food", "amount": 5000, "user_id": MOCK_USER_ID}
    ),
    Document(
        page_content="On 2024-03-15, an income of ₹100000 was recorded for Salary.",
        metadata={"date": "2024-03-15", "category": "Salary", "amount": 100000, "user_id": MOCK_USER_ID}
    ),
    Document(
        page_content="On 2024-03-20, an expense of ₹200 for coffee at Starbucks was recorded in Food.",
        metadata={"date": "2024-03-20", "category": "Food", "amount": 200, "user_id": MOCK_USER_ID}
    ),
    Document(
        page_content="On 2024-03-25, an expense of ₹45000 was recorded for rent payment in Housing.",
        metadata={"date": "2024-03-25", "category": "Housing", "amount": 45000, "user_id": MOCK_USER_ID}
    ),
]

async def test_workflow():
    print("🚀 Starting verification of Advanced RAG System")
    
    # 1. Mock the SQL loader the pipeline depends on
    print("\n--- Phase 1: Ingestion ---")
    with patch("app.ingestion.pipeline.load_sql_transactions", return_value=MOCK_DOCS):
        count = await ingest_sql_data(MOCK_USER_ID)
        print(f"✅ Ingested {count} mock documents for user {MOCK_USER_ID}")

    # 2. Test Retrieval with Reranking
    print("\n--- Phase 2: Retrieval & Reranking ---")
    query = "Find my expensive food transactions"
    print(f"Query: '{query}'")
    
    results = retrieve_docs(MOCK_USER_ID, query)
    
    if results:
        print(f"✅ Retrieved {len(results)} relevant documents:")
        for i, doc in enumerate(results):
            print(f"  [{i+1}] {doc.page_content}")
            
        # Verify if the ₹5000 food transaction (most relevant) is near the top
        if "5000" in results[0].page_content:
            print("\n🌟 SUCCESS: Reranker correctly prioritized the large food transaction!")
        else:
            print("\n⚠️ WARNING: Similarity search worked, but reranking didn't hit the intended top spot.")
    else:
        print("❌ FAILED: No documents retrieved.")

    # 3. Cleanup
    print("\n--- Phase 3: Cleanup ---")
    manager = FAISSManager()
    deleted = manager.delete_index(MOCK_USER_ID)
    if deleted:
        print(f"✅ Cleaned up temporary test index for {MOCK_USER_ID}")

if __name__ == "__main__":
    asyncio.run(test_workflow())
