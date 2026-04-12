"""
loader.py

Purpose:
--------
Loads all relevant data from the PostgreSQL database using LangChain's SQLDatabaseLoader.
This provides the complete source data for the vector indexing pipeline, enabling comprehensive similarity search.
"""

from loguru import logger
from langchain_community.utilities import SQLDatabase
from langchain_community.document_loaders import SQLDatabaseLoader
from app.core.config import settings


def load_user_database(user_id: str = None):
    """
    Load data across multiple tables from the database for a specific user (or all if user_id is None).
    """
    logger.info(f"Loading complete database records for user: {user_id or 'all'}")

    try:
        db = SQLDatabase.from_uri(settings.DATABASE_URL)
        all_docs = []

        # 1. Transactions
        tx_query = f"""
            SELECT amount, category, type, date, description
            FROM "Transaction" WHERE "userId" = '{user_id}' ORDER BY date DESC
        """ if user_id else "SELECT amount, category, type, date, description FROM \"Transaction\" ORDER BY date DESC"
        
        try:
            tx_loader = SQLDatabaseLoader(db=db, query=tx_query)
            tx_docs = tx_loader.load()
            for doc in tx_docs:
                meta = doc.metadata
                content = (
                    f"Transaction Record: On {meta.get('date', 'Unknown Date')}, a {meta.get('type', 'transaction')} "
                    f"of ₹{meta.get('amount', '0')} was recorded in the {meta.get('category', 'General')} category. "
                    f"Description: {meta.get('description', 'No description provided')}."
                )
                doc.page_content = content
                if user_id: doc.metadata["user_id"] = user_id
            all_docs.extend(tx_docs)
            logger.info(f"Loaded {len(tx_docs)} transaction records.")
        except Exception as e:
            logger.error(f"Failed to load transactions: {e}")

        # 2. Documents
        doc_query = f"""
            SELECT "fileName", "fileType", "status", "extractedData", "createdAt"
            FROM "Document" WHERE "userId" = '{user_id}'
        """ if user_id else "SELECT \"fileName\", \"fileType\", \"status\", \"extractedData\", \"createdAt\" FROM \"Document\""
        try:
            doc_loader = SQLDatabaseLoader(db=db, query=doc_query)
            docs = doc_loader.load()
            for d in docs:
                meta = d.metadata
                content = (
                    f"Document Record: Uploaded '{meta.get('fileName')}' (Type: {meta.get('fileType')}) on {meta.get('createdAt')}. "
                    f"Status: {meta.get('status')}. Extracted Data: {meta.get('extractedData')}."
                )
                d.page_content = content
                if user_id: d.metadata["user_id"] = user_id
            all_docs.extend(docs)
            logger.info(f"Loaded {len(docs)} document records.")
        except Exception as e:
            logger.error(f"Failed to load documents: {e}")

        # 3. Watchlist
        wl_query = f"""
            SELECT symbol, name, "addedAt"
            FROM "Watchlist" WHERE "userId" = '{user_id}'
        """ if user_id else "SELECT symbol, name, \"addedAt\" FROM \"Watchlist\""
        try:
            wl_loader = SQLDatabaseLoader(db=db, query=wl_query)
            wl_docs = wl_loader.load()
            for w in wl_docs:
                meta = w.metadata
                content = f"Watchlist Record: User is watching asset '{meta.get('name')}' (Symbol: {meta.get('symbol')}), added on {meta.get('addedAt')}."
                w.page_content = content
                if user_id: w.metadata["user_id"] = user_id
            all_docs.extend(wl_docs)
            logger.info(f"Loaded {len(wl_docs)} watchlist records.")
        except Exception as e:
            logger.error(f"Failed to load watchlist: {e}")

        # 4. AuditTrail
        audit_query = f"""
            SELECT action, entity, details, "createdAt"
            FROM "AuditTrail" WHERE "userId" = '{user_id}'
        """ if user_id else "SELECT action, entity, details, \"createdAt\" FROM \"AuditTrail\""
        try:
            audit_loader = SQLDatabaseLoader(db=db, query=audit_query)
            audit_docs = audit_loader.load()
            for a in audit_docs:
                meta = a.metadata
                content = f"Audit Log Record: User performed action '{meta.get('action')}' on {meta.get('entity')} at {meta.get('createdAt')}. Details: {meta.get('details')}."
                a.page_content = content
                if user_id: a.metadata["user_id"] = user_id
            all_docs.extend(audit_docs)
            logger.info(f"Loaded {len(audit_docs)} audit trail records.")
        except Exception as e:
            logger.error(f"Failed to load audit trail: {e}")

        logger.info(f"Successfully loaded {len(all_docs)} total documents across all database entities.")
        return all_docs

    except Exception as e:
        logger.error(f"Failed to load SQL database context: {str(e)}")
        return []