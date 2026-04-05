"""
events.py

Purpose:
--------
Defines standard event formats for streaming.

Why this matters:
-----------------
- Frontend depends on consistent structure
- Enables rich UI (agent thoughts, tool calls, final answer)
"""

from typing import Dict, Any


def agent_event(agent_name: str) -> Dict[str, Any]:
    """
    Event when an agent starts execution.
    """
    return {
        "type": "agent",
        "agent": agent_name,
    }


def tool_event(tool_name: str) -> Dict[str, Any]:
    """
    Event when a tool is invoked.
    """
    return {
        "type": "tool",
        "tool": tool_name,
    }


def token_event(token: str) -> Dict[str, Any]:
    """
    Event for streaming tokens.
    """
    return {
        "type": "token",
        "content": token,
    }


def final_event(output: str) -> Dict[str, Any]:
    """
    Final response event.
    """
    return {
        "type": "final",
        "output": output,
    }