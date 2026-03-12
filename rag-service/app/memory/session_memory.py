"""
session_memory.py — In-memory conversation history management.

Stores per-session message lists so the LangGraph agent has access to
prior turns within a session. Uses a simple dict for dev; can be swapped
to a Redis-backed store for multi-instance production deployments.
"""

import logging
from collections import defaultdict
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage

logger = logging.getLogger(__name__)

# Simple in-process store: { session_id: [messages] }
_store: dict[str, list[BaseMessage]] = defaultdict(list)

MAX_HISTORY_TURNS = 20  # Keep last N turns (user + AI = 2 messages each)


def get_history(session_id: str) -> list[BaseMessage]:
    """Return all messages for a session."""
    return _store[session_id]


def add_turn(session_id: str, user_message: str, ai_response: str):
    """Append a user/AI turn to the session history."""
    _store[session_id].append(HumanMessage(content=user_message))
    _store[session_id].append(AIMessage(content=ai_response))

    # Trim to max turns (2 messages per turn)
    max_messages = MAX_HISTORY_TURNS * 2
    if len(_store[session_id]) > max_messages:
        _store[session_id] = _store[session_id][-max_messages:]

    logger.debug(f"Session {session_id}: {len(_store[session_id])} messages in history")


def clear_session(session_id: str):
    """Clear history for a session (useful for 'clear chat' feature)."""
    if session_id in _store:
        del _store[session_id]
        logger.info(f"Cleared session history: {session_id}")
