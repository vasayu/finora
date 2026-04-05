"""
chat.py

Purpose:
--------
Chat endpoint. Accepts user message + session/user context,
runs LangGraph, returns response or HITL signal.

Schema aligned with backend proxy which injects user_id from JWT.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from langgraph.errors import GraphInterrupt

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str
    user_id: str = ""


@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Run LangGraph with the user's message.

    Returns:
        dict: answer or HITL pause signal (with interrupt_type + options)
    """
    # Import at function level to avoid circular import
    from main import graph

    inputs = {
        "messages": [HumanMessage(content=request.message)],
        "user_id": request.user_id,
    }

    config = {
        "configurable": {"thread_id": request.session_id},
        "recursion_limit": 100,
    }

    # Prevent user from submitting new messages while a checkpoint is paused
    state = await graph.aget_state(config)
    if state.next:
        return {
            "answer": "A high-value action is currently waiting for your approval. Please approve or reject it using the buttons before sending new messages.",
            "session_id": request.session_id,
        }

    try:
        result = await graph.ainvoke(inputs, config=config)

        messages = result.get("messages", [])
        final_message = messages[-1].content if messages else "No response generated."

        return {
            "answer": final_message,
            "session_id": request.session_id,
        }

    except GraphInterrupt as interrupt:
        payload = interrupt.args[0] if interrupt.args else {}

        # Extract typed interrupt info from the payload
        interrupt_type = payload.get("interrupt_type", "large_transaction")
        options = payload.get("options", [])
        message = payload.get("message", "This action requires your approval.")
        metadata = payload.get("metadata", {})

        return {
            "status": "requires_approval",
            "answer": message,
            "interrupt_type": interrupt_type,   # 'large_transaction' | 'categorize_transaction'
            "options": options,                  # [] for yes/no, list of categories otherwise
            "metadata": metadata,               # amount, description, etc.
            "session_id": request.session_id,
        }

    except Exception as e:
        return {
            "answer": f"An error occurred: {str(e)}",
            "session_id": request.session_id,
        }