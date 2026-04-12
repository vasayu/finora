"""
financial_db.py — LangChain tool: live financial data query from PostgreSQL.
Uses InjectedState to get user_id from the graph state.
"""

import json
from datetime import datetime, timedelta
from typing import Literal, Annotated, Optional

from langchain_core.tools import StructuredTool
from langgraph.prebuilt import InjectedState
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text
from loguru import logger

from app.core.config import settings

# Lazy engine
_engine_instance = None

def _get_engine():
    global _engine_instance
    if _engine_instance is None:
        # Strip Prisma-specific params (e.g. ?schema=public) that psycopg2 rejects
        db_url = settings.DATABASE_URL.split("?")[0]
        logger.info(f"[financial_db] Connecting to: {db_url[:40]}...")
        _engine_instance = create_engine(
            db_url,
            pool_pre_ping=True,
            connect_args={"options": "-csearch_path=public"},
        )
    return _engine_instance

class FinancialDBInput(BaseModel):
    query_type: Literal["summary", "transactions", "alerts", "monthly_records"] = Field(
        ..., 
        description="Type of data to retrieve: summary (totals), transactions (history), alerts, or monthly_records."
    )
    days: int = Field(default=30, description="Number of past days to look back (default: 30).")

async def financial_db_query(
    query_type: Literal["summary", "transactions", "alerts", "monthly_records"],
    state: Annotated[dict, InjectedState],
    days: int = 30,
) -> str:
    """
    Query the user's live financial data from the database.
    Use this tool to answer questions about the user's income, expenses,
    transaction history, financial alerts, or monthly financial records.
    """
    user_id = state.get("user_id")
    if not user_id:
        return "Error: No user_id found in session. Cannot query database."

    logger.info(f"[financial_db_query] user={user_id} type={query_type} days={days}")
    since = datetime.utcnow() - timedelta(days=days)

    try:
        with _get_engine().connect() as conn:
            if query_type == "summary":
                result = conn.execute(
                    text("""
                        SELECT
                            COUNT(*) as total_transactions,
                            COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as total_income,
                            COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as total_expense,
                            COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE -amount END), 0) as net_profit
                        FROM "Transaction"
                        WHERE "userId" = :user_id AND date >= :since
                    """),
                    {"user_id": user_id, "since": since},
                ).fetchone()
                data = {
                    "period_days": days,
                    "total_transactions": result[0],
                    "total_income": float(result[1]),
                    "total_expense": float(result[2]),
                    "net_profit": float(result[3]),
                }

            elif query_type == "transactions":
                rows = conn.execute(
                    text("""
                        SELECT amount, currency, type, category, date, description
                        FROM "Transaction"
                        WHERE "userId" = :user_id AND date >= :since
                        ORDER BY date DESC
                        LIMIT 50
                    """),
                    {"user_id": user_id, "since": since},
                ).fetchall()
                data = [
                    {
                        "amount": float(r[0]),
                        "currency": r[1],
                        "type": r[2],
                        "category": r[3],
                        "date": str(r[4]),
                        "description": r[5],
                    }
                    for r in rows
                ]

            elif query_type == "alerts":
                rows = conn.execute(
                    text("""
                        SELECT type, message, "isRead", "createdAt"
                        FROM "Alert"
                        WHERE "userId" = :user_id
                        ORDER BY "createdAt" DESC
                        LIMIT 20
                    """),
                    {"user_id": user_id},
                ).fetchall()
                data = [
                    {"type": r[0], "message": r[1], "is_read": r[2], "created_at": str(r[3])}
                    for r in rows
                ]

            elif query_type == "monthly_records":
                # Find the organizationId first
                org_res = conn.execute(
                    text("SELECT \"organizationId\" FROM \"User\" WHERE id = :user_id"),
                    {"user_id": user_id}
                ).fetchone()
                
                if not org_res or not org_res[0]:
                    return "No monthly records found (user not part of an organization)."
                
                org_id = org_res[0]
                
                rows = conn.execute(
                    text("""
                        SELECT month, year, "totalIncome", "totalExpense", "netProfit",
                               assets, liabilities, equity
                        FROM "FinancialRecord"
                        WHERE "organizationId" = :org_id
                        ORDER BY year DESC, month DESC
                        LIMIT 12
                    """),
                    {"org_id": org_id},
                ).fetchall()
                data = [
                    {
                        "month": r[0], "year": r[1],
                        "total_income": float(r[2]), "total_expense": float(r[3]),
                        "net_profit": float(r[4]), "assets": float(r[5]),
                        "liabilities": float(r[6]), "equity": float(r[7]),
                    }
                    for r in rows
                ]
            else:
                return f"Unknown query_type: {query_type}"

        if not data:
            return f"No {query_type} data found for the last {days} days."

        return json.dumps(data, default=str, indent=2)

    except Exception as e:
        logger.error(f"[financial_db_query] DB error: {e}")
        return f"Database query failed: {str(e)}"

# Registering as a StructuredTool for LangGraph compatibility
# NOTE: must use coroutine= (not func=) because financial_db_query is async
financial_db_tool = StructuredTool.from_function(
    coroutine=financial_db_query,
    name="financial_db_query",
    description="Query user's live financial data (transactions, sums, alerts, monthly reports) from the database.",
    args_schema=FinancialDBInput,
)
