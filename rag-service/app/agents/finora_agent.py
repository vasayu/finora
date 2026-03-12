"""
finora_agent.py — LangGraph ReAct Agent for Finora AI.

Graph topology:
  [START] → agent_node → (has tool calls?) → tool_node → agent_node (loop)
                       → (no tool calls)  → [END]

The agent is re-constructed per request to scope tools to a specific user_id.
"""

import logging
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import create_react_agent

from app.config import get_settings
from app.tools.document_search import make_document_search_tool
from app.tools.financial_db import make_financial_db_tool
from app.vectorstore.faiss_manager import FAISSManager

logger = logging.getLogger(__name__)
settings = get_settings()

# Shared FAISS manager (singleton)
_faiss_manager = FAISSManager()

SYSTEM_PROMPT = """You are Finora AI, an expert financial intelligence assistant embedded in the Finora platform.

You have access to two tools:
1. **document_search** — Search the user's uploaded financial documents (PDFs, CSVs, reports, statements, invoices).
2. **financial_db_query** — Query the user's live financial data (transactions, income, expenses, alerts, monthly records).

Guidelines:
- Always use tools to ground your answers in the user's actual data. Do not fabricate numbers.
- For document-related questions (e.g., "what does my invoice say?"), use `document_search`.
- For live financial metrics (e.g., "how much did I spend this month?"), use `financial_db_query`.
- For complex questions, use BOTH tools and synthesize the results.
- Provide specific, data-driven answers with clear formatting (use bullet points and numbers).
- If no data is found, clearly say so — never hallucinate financial figures.
- Be professional, concise, and actionable.
"""


def build_agent(user_id: str):
    """
    Build a LangGraph ReAct agent scoped to a specific user.
    Tools are constructed with user_id baked in — the LLM cannot escape this scope.
    """
    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.2,
        streaming=False,
        openai_api_key=settings.openai_api_key,
    )

    # User-scoped tools — user_id is baked into the closure
    tools = [
        make_document_search_tool(user_id, _faiss_manager),
        make_financial_db_tool(user_id),
    ]

    agent = create_react_agent(
        model=llm,
        tools=tools,
        state_modifier=SystemMessage(content=SYSTEM_PROMPT),
    )

    logger.debug(f"Built agent for user {user_id} with {len(tools)} tools")
    return agent


async def run_agent(
    user_id: str,
    message: str,
    history: list,
) -> tuple[str, list[str]]:
    """
    Run the agent for a single turn and return (answer, tools_used).

    Args:
        user_id:  Authenticated user ID (from JWT, never from client body).
        message:  Current user message.
        history:  Prior conversation messages (HumanMessage / AIMessage list).

    Returns:
        A tuple of (final_answer_str, [list_of_tool_names_used])
    """
    from langchain_core.messages import HumanMessage

    agent = build_agent(user_id)

    # Build message list: history + current turn
    messages = history + [HumanMessage(content=message)]

    try:
        result = await agent.ainvoke({"messages": messages})
    except Exception as e:
        logger.error(f"Agent invocation error for user {user_id}: {e}")
        raise

    all_messages = result.get("messages", [])

    # Extract final AI response (last AIMessage)
    final_answer = ""
    for msg in reversed(all_messages):
        if hasattr(msg, "content") and msg.__class__.__name__ == "AIMessage":
            final_answer = msg.content
            break

    # Extract names of tools that were actually called
    tools_used = []
    for msg in all_messages:
        if msg.__class__.__name__ == "ToolMessage":
            name = getattr(msg, "name", None)
            if name and name not in tools_used:
                tools_used.append(name)

    return final_answer, tools_used
