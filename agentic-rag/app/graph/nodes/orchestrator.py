"""
orchestrator.py

Purpose:
--------
Async orchestrator node. Classifies user intent and sets active_agent.
"""

from loguru import logger

from app.graph.state.graph_state import GraphState
from app.agents.orchestrator.planner import plan_agent
from app.graph.state.types import AgentType


async def orchestrator_node(state: GraphState) -> dict:
    """
    Orchestrator: classifies user intent → sets active_agent.

    Args:
        state (GraphState): Current graph state

    Returns:
        dict: State update with active_agent set
    """
    logger.info("Orchestrator: analyzing user intent...")

    messages = state.get("messages", [])

    if not messages:
        logger.warning("No messages → defaulting to FINANCE")
        return {"active_agent": AgentType.FINANCE}

    try:
        selected_agent: AgentType = await plan_agent(messages)
        last_msg = messages[-1].content if messages else "empty"
        logger.info(f"Orchestrator: user_query='{last_msg[:100]}' → selected_agent={selected_agent}")
        return {"active_agent": selected_agent}

    except Exception as e:
        logger.error(f"Planner failed: {e} → defaulting to FINANCE")
        return {"active_agent": AgentType.FINANCE}

