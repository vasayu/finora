"""
short_term.py

Purpose:
--------
Provides a checkpointer for LangGraph.

Why this matters:
-----------------
- Maintains conversation state
- Required for streaming + HITL resume
- Enables multi-turn interactions
"""

from langgraph.checkpoint.memory import MemorySaver


def get_checkpointer():
    """
    Initialize in-memory checkpointer.

    Returns:
        MemorySaver: LangGraph memory checkpointer
    """

    return MemorySaver()