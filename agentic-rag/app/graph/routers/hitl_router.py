"""
hitl_router.py

Purpose:
--------
Decides whether an action requires human approval.

Why this matters:
-----------------
- Prevents dangerous or unintended actions
- Adds safety layer to agent system
"""

from loguru import logger
from app.graph.state.graph_state import GraphState


# Simple threshold (can be dynamic later)
HITL_AMOUNT_THRESHOLD = 10000  # example: ₹10,000


def hitl_router(state: GraphState) -> str:
    """
    Check if current action requires human approval.

    Args:
        state (GraphState): Current graph state

    Returns:
        str: Next node ("hitl_node" or "continue")
    """

    messages = state.get("messages", [])

    if not messages:
        return "continue"

    last_message = messages[-1]

    # Check tool calls
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        for tool_call in last_message.tool_calls:
            args = tool_call.get("args", {})

            amount = args.get("amount")

            if amount and amount > HITL_AMOUNT_THRESHOLD:
                logger.warning(
                    f"HITL triggered for high amount: {amount}"
                )
                return "hitl_node"

    return "continue"