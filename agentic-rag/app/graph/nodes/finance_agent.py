"""
finance_agent.py

Purpose:
--------
Async finance agent node. Calls LLM with tools bound.
The LLM decides whether to call a tool or return an answer.

Key fix: uses await llm.ainvoke() (not .invoke) — non-blocking.
"""

from loguru import logger
from langchain_core.messages import AIMessage, SystemMessage

from app.graph.state.graph_state import GraphState
from app.core.llm_with_tools import get_llm_with_tools


FINANCE_SYSTEM_PROMPT = """You are Finora AI, an expert financial agent.

If the user wants to add, record, or log a transaction:
- Use the add_transaction tool
- Always include the user_id from the conversation context
- Be precise with amounts and categories

If the user asks about their financial history, summary, or specific numbers:
- Use the **financial_db_query** tool for specific live data (history, counts, totals).
- Use the **search_docs** tool for file-based retrieval.
- NEVER say you lack access. Always try the tools first.
- If a tool returns no results, do NOT keep retrying with the same parameters. Inform the user you couldn't find those specific records.
- End the loop once you have provided an helpful summary or handled the user's action.

Provide clear, formatted final responses with bullet points where appropriate."""


async def finance_agent(state: GraphState) -> dict:
    """
    Finance agent: handles money operations using tool-enabled LLM.

    Args:
        state (GraphState): Current graph state

    Returns:
        dict: State update with new messages
    """
    logger.info("Finance agent executing...")

    llm = get_llm_with_tools()

    messages = state.get("messages", [])
    user_id = state.get("user_id", "")

    # Inject system prompt + user_id context
    system_msg = SystemMessage(
        content=f"{FINANCE_SYSTEM_PROMPT}\n\nCurrent user_id: {user_id}"
    )

    full_messages = [system_msg] + list(messages)

    response: AIMessage = await llm.ainvoke(full_messages)

    logger.info(f"Finance agent done. Tool calls: {bool(getattr(response, 'tool_calls', None))}")

    return {"messages": [response]}