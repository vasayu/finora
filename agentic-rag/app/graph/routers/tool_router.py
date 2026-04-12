"""
tool_router.py

Purpose:
--------
Routes execution based on whether the LLM invoked a tool.

Why this matters:
-----------------
- Enables agent ↔ tool loop
- Core of ReAct pattern
"""

from loguru import logger

from app.graph.state.graph_state import GraphState


def tool_router(state: GraphState) -> str:
    """
    Decide whether to call a tool or end execution.

    Args:
        state (GraphState): Current graph state

    Returns:
        str: Next node ("tool_node" or "end")
    """

    messages = state.get("messages", [])

    if not messages:
        logger.warning("No messages found, ending execution")
        return "end"

    last_message = messages[-1]

    # Check if LLM invoked a tool
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        logger.info("Tool call detected → routing to tool_node")
        return "tool_node"

    logger.info("No tool call → ending execution")
    return "end"