"""
guardrail_node.py

Purpose:
--------
Handles off-topic queries by returning a standard, polite response.
This node ensures the AI stays within the financial domain.
"""

from loguru import logger
from langchain_core.messages import AIMessage

from app.graph.state.graph_state import GraphState


async def guardrail_node(state: GraphState) -> dict:
    """
    Guardrail node: handles off-topic queries by returning a standard response.

    Args:
        state (GraphState): Current graph state

    Returns:
        dict: State update with the guardrail message
    """
    logger.info("Guardrail node executing (off-topic detected)...")

    guardrail_response = (
        "I am Finora AI, your dedicated financial assistant. "
        "I can only help you with questions related to your transactions, financial data, "
        "and wealth management. Please ask me something related to your finances!"
    )

    return {"messages": [AIMessage(content=guardrail_response)]}
