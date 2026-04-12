"""
add_transaction.py

Purpose:
--------
Tool to add a financial transaction via backend API.
Uses internal secret header to bypass JWT auth.

Flow:
-----
LLM → Tool → Backend API (x-internal-secret) → Prisma → Postgres
"""

import httpx
from loguru import logger
from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
from typing import Optional

from app.core.config import settings
from app.ingestion.pipeline import ingest_sql_data


class AddTransactionInput(BaseModel):
    amount: float = Field(..., description="Transaction amount (positive number)")
    type: str = Field(..., description="Transaction type: INCOME or EXPENSE")
    category: str = Field(..., description="Category e.g. Food, Transport, Salary")
    currency: str = Field(default="USD", description="Currency code, e.g. USD")
    description: Optional[str] = Field(default=None, description="Optional description")
    user_id: str = Field(..., description="User ID to associate the transaction with")


async def add_transaction(
    amount: float,
    type: str,
    category: str,
    user_id: str,
    currency: str = "USD",
    description: Optional[str] = None,
) -> dict:
    """
    Calls backend API to create a transaction using internal auth.

    Returns:
        dict: Success or error response
    """
    try:
        logger.info(f"add_transaction: amount={amount}, type={type}, category={category}, user={user_id}")

        payload = {
            "amount": amount,
            "type": type.upper(),
            "category": category,
            "currency": currency,
            "description": description,
            "date": None,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{settings.BACKEND_BASE_URL}/transactions",
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "x-internal-secret": settings.INTERNAL_SECRET,
                    "x-user-id": user_id,
                },
            )

        if response.status_code in (200, 201):
            data = response.json()
            logger.success(f"Transaction created: {data}")

            # Trigger FAISS re-ingestion so search_docs has fresh data
            try:
                await ingest_sql_data(user_id)
                logger.info(f"FAISS re-ingested after transaction for user {user_id}")
            except Exception as e:
                logger.warning(f"FAISS re-ingestion failed (non-fatal): {e}")

            return {
                "status": "success",
                "message": f"Successfully added {type} of {amount} {currency} for {category}.",
                "data": data,
            }
        else:
            logger.error(f"Backend error {response.status_code}: {response.text}")
            return {
                "status": "error",
                "message": f"Backend returned {response.status_code}: {response.text}",
            }

    except Exception as e:
        logger.error(f"add_transaction failed: {e}")
        return {
            "status": "error",
            "message": str(e),
        }


add_transaction_tool = StructuredTool.from_function(
    coroutine=add_transaction,
    name="add_transaction",
    description=(
        "Add a financial transaction (income or expense) to the database. "
        "Use this when the user asks to add, record, or log a transaction."
    ),
    args_schema=AddTransactionInput,
)