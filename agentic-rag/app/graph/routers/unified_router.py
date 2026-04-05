"""
unified_router.py

Purpose:
--------
Single router: checks HITL threshold / category-missing → tool_node → END.

Two HITL triggers:
  1. large_transaction  – amount exceeds HITL_AMOUNT_THRESHOLD
  2. categorize_transaction – LLM requested add_transaction but omitted category
"""

from loguru import logger
from langgraph.graph import END

from app.graph.state.graph_state import GraphState

HITL_AMOUNT_THRESHOLD = 10000

# Standard transaction categories the user can pick from
TRANSACTION_CATEGORIES = [
    "Food & Dining",
    "Transport",
    "Shopping",
    "Healthcare",
    "Utilities",
    "Entertainment",
    "Salary / Income",
    "Investments",
    "Rent / Housing",
    "Other",
]


def unified_router(state: GraphState) -> str:
    """
    Unified routing after an agent node runs.

    Priority:
    ---------
    1. Tool call present → check HITL amount threshold
    2. If risky amount → hitl_node (type = large_transaction)
    3. If category missing → hitl_node (type = categorize_transaction)
    4. If safe tool call → tool_node
    5. No tool call → END

    Returns:
        str: next node key matching builder path map
    """
    messages = state.get("messages", [])

    if not messages:
        return END

    last_message = messages[-1]

    # Check if LLM issued a tool call
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:

        for tool_call in last_message.tool_calls:
            args = tool_call.get("args", {})
            amount = args.get("amount")
            category = args.get("category", "").strip()

            # HITL trigger 1: high-value transaction
            if amount and float(amount) > HITL_AMOUNT_THRESHOLD:
                logger.warning(f"HITL triggered (large_transaction): amount={amount}")
                return "hitl_node"

            # HITL trigger 2: category is missing / blank
            if tool_call.get("name") in ("add_transaction", "record_transaction"):
                if not category:
                    logger.warning("HITL triggered (categorize_transaction): category missing")
                    return "hitl_node"

        # Safe tool call — proceed to execution
        logger.info("Tool call detected → tool_node")
        return "tool_node"

    # No tool call — agent has given its final answer
    logger.info("No tool call → END")
    return END
