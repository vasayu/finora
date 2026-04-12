"""
parsers.py

Purpose:
--------
Shared schemas aligned with Prisma DB models.

Critical:
---------
- Must match DB exactly (prevents runtime failures)
- Used by tools + agents
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class TransactionType(str, Enum):
    """
    Matches Prisma TxType enum.
    """
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"


class AddTransactionInput(BaseModel):
    """
    Schema for adding a transaction (aligned with DB).
    """

    amount: float = Field(..., description="Transaction amount")
    type: TransactionType = Field(..., description="Transaction type")
    category: str = Field(..., description="Transaction category")
    currency: str = Field("USD", description="Currency code")
    description: Optional[str] = Field(None, description="Optional description")
    date: Optional[datetime] = Field(None, description="Transaction date")
    user_id: str = Field(..., description="User ID")
    organization_id: Optional[str] = Field(
        None, description="Organization ID (if applicable)"
    )


class DeleteTransactionInput(BaseModel):
    """
    Schema for deleting a transaction.
    """

    transaction_id: str = Field(..., description="Transaction ID")


class GetTransactionsInput(BaseModel):
    """
    Schema for querying transactions.
    """

    user_id: str = Field(..., description="User ID")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    category: Optional[str] = None
    type: Optional[TransactionType] = None