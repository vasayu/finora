"""
main_router.py

Purpose:
--------
Routes orchestrator → worker agent.

Fix:
----
- analytics and validation now route to rag_agent/finance_agent
  since those nodes aren't registered (only finance + rag are).
"""

from loguru import logger

from app.graph.state.graph_state import GraphState
from app.graph.state.types import AgentType


def main_router(state: GraphState) -> str:
    """
    Route to the appropriate agent node.

    Returns:
        str: registered node name
    """
    agent = state.get("active_agent")
    logger.info(f"main_router: agent={agent}")

    if agent == AgentType.FINANCE:
        return "finance_agent"

    if agent == AgentType.RAG:
        return "rag_agent"

    # Analytics and validation fall back to finance (data-focused)
    if agent == AgentType.ANALYTICS:
        logger.info("ANALYTICS → finance_agent (fallback)")
        return "finance_agent"

    if agent == AgentType.VALIDATION:
        logger.info("VALIDATION → rag_agent (fallback)")
        return "rag_agent"

    if agent == AgentType.GUARDRAIL:
        logger.info("GUARDRAIL → guardrail_node")
        return "guardrail_node"

    # Final safety fallback
    logger.warning(f"Unknown agent '{agent}' → finance_agent")
    return "finance_agent"