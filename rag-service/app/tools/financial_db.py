"""
financial_db.py — LangChain tool: live financial data query from PostgreSQL.

Queries the same database as the Express backend, but filtered to a single user.
user_id is injected at construction time — not from LLM input.
"""

import logging
import json
from datetime import datetime, timedelta
from typing import Literal

from langchain_core.tools import tool
from sqlalchemy import create_engine, text

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Lazy engine — created on first use so it always reads the current DB URL
_engine_instance = None


def _get_engine():
    global _engine_instance
    if _engine_instance is None:
        # Keep original URL but ensure we don't pass -csearch_path to Neon pooler
        db_url = settings.database_url
        logger.info(f"[financial_db] Connecting to DB...")
        _engine_instance = create_engine(
            db_url,
            pool_pre_ping=True,
            # Removed connect_args with search_path as Neon pooler rejects it
        )

    return _engine_instance


def make_financial_db_tool(user_id: str):
    """
    Factory returning a Prisma-compatible PostgreSQL query tool scoped to a user.
    """

    @tool
    def financial_db_query(
        query_type: Literal["summary", "transactions", "alerts", "monthly_records"],
        days: int = 30,
    ) -> str:
        """
        Query the user's live financial data from the database.
        Use this tool to answer questions about the user's income, expenses,
        transaction history, financial alerts, or monthly financial records.

        Args:
            query_type: Type of data to retrieve:
                - "summary": Total income, expenses, net profit for the period
                - "transactions": List of recent transactions with amounts and categories
                - "alerts": Recent financial alerts (low balance, anomalies, etc.)
                - "monthly_records": Monthly financial record summaries
            days: Number of past days to look back (default: 30)

        Returns:
            JSON-formatted financial data.
        """
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
                    rows = conn.execute(
                        text("""
                            SELECT month, year, "totalIncome", "totalExpense", "netProfit",
                                   assets, liabilities, equity
                            FROM "FinancialRecord"
                            WHERE "organizationId" IN (
                                SELECT "organizationId" FROM "User" WHERE id = :user_id AND "organizationId" IS NOT NULL
                            )
                            ORDER BY year DESC, month DESC
                            LIMIT 12
                        """),
                        {"user_id": user_id},
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

    return financial_db_query
