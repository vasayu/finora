"""
chat.py — POST /chat route.

Receives a message, retrieves session history, runs the LangGraph agent,
saves the new turn, and returns the answer.
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.agents.finora_agent import run_agent
from app.memory.session_memory import get_history, add_turn, clear_session

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    user_id: str = Field(..., description="Authenticated user ID (from JWT, validated by Express)")
    message: str = Field(..., min_length=1, max_length=4000, description="User's message")
    session_id: str = Field(..., description="Unique session/conversation identifier")


class ChatResponse(BaseModel):
    answer: str
    tools_used: list[str]
    session_id: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Run the Finora AI agent for one conversational turn.

    - user_id MUST be the JWT-verified user ID from the Express backend.
    - The agent searches only that user's documents and financial data.
    """
    logger.info(
        f"Chat request | user={request.user_id} | session={request.session_id} | "
        f"message_len={len(request.message)}"
    )

    try:
        history = get_history(request.session_id)
        answer, tools_used = await run_agent(
            user_id=request.user_id,
            message=request.message,
            history=history,
        )
        add_turn(request.session_id, request.message, answer)

        return ChatResponse(
            answer=answer,
            tools_used=tools_used,
            session_id=request.session_id,
        )

    except Exception as e:
        logger.error(f"Chat error for user {request.user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Agent failed to process the request.")


class ClearSessionRequest(BaseModel):
    session_id: str


@router.post("/chat/clear")
async def clear_chat(request: ClearSessionRequest):
    """Clear conversation history for a session (e.g., 'New Chat' button)."""
    clear_session(request.session_id)
    return {"success": True, "message": f"Session {request.session_id} cleared."}
