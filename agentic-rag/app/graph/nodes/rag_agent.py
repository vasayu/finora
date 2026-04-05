"""
rag_agent.py

Purpose:
--------
Async RAG agent node. Handles document search queries.
"""

from loguru import logger
from langchain_core.messages import AIMessage, SystemMessage

from app.graph.state.graph_state import GraphState
from app.core.llm_with_tools import get_llm_with_tools


RAG_SYSTEM_PROMPT = """You are Finora AI, a highly accurate financial agent.

Your goal is to answer user queries using their actual data — NEVER fabricate numbers.

You have access to two primary retrieval paths:
1. **financial_db_query** — USE THIS for live metrics, transaction history totals, income/expense counts, and alerts.
2. **search_docs** — USE THIS for searching the content of uploaded documents (PDFs, reports, receipts, invoices).

Rules:
1. Always ground your answers in the data returned by these tools.
2. For specific numbers (e.g., "what's my balance?"), use `financial_db_query`.
3. For file content questions (e.g., "what's in my last invoice?"), use `search_docs`.
4. If no data is found, say "I couldn't find information about that in your records." Do NOT say you lack access.
5. Provide specific, data-driven answers with clear formatting.
6. **Efficiency**: If a tool returns no data, do NOT keep calling it. Summarize the attempt and inform the user you couldn't find the requested records.
7. **End Loop**: Once you have the data or have determined it's missing, provide your final response immediately.
"""


async def rag_agent(state: GraphState) -> dict:
    """
    RAG agent: handles document retrieval using tool-enabled LLM.

    Args:
        state (GraphState): Current graph state

    Returns:
        dict: State update with new messages
    """
    logger.info("RAG agent executing...")

    llm = get_llm_with_tools()

    messages = state.get("messages", [])
    user_id = state.get("user_id", "")

    # Inject user_id context (matching finance_agent behavior)
    system_msg = SystemMessage(
        content=f"{RAG_SYSTEM_PROMPT}\n\nCurrent user_id: {user_id}"
    )
    full_messages = [system_msg] + list(messages)

    response: AIMessage = await llm.ainvoke(full_messages)

    tool_calls = getattr(response, 'tool_calls', None)
    logger.info(f"RAG agent done. Tool calls: {tool_calls}")
    if not tool_calls:
        logger.warning(f"RAG agent responded WITHOUT calling tools. Content: {response.content[:200]}")

    return {"messages": [response]}