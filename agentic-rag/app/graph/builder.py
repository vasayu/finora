"""
builder.py

Purpose:
--------
Builds and compiles the LangGraph (production-safe, fixed version).

Key fixes:
----------
- No duplicate static + conditional edges for same source node
- tool_return_router defined inside build_graph scope
- analytics/validation route correctly to rag_agent fallback
- main_router returns only registered node names
"""

from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from app.graph.state.graph_state import GraphState
from app.graph.state.types import AgentType

from app.graph.nodes.orchestrator import orchestrator_node
from app.graph.nodes.finance_agent import finance_agent
from app.graph.nodes.rag_agent import rag_agent
from app.graph.nodes.guardrail_node import guardrail_node
from app.graph.nodes.input_guardrail import input_guardrail_node
from app.graph.nodes.output_guardrail import output_guardrail_node
from app.graph.nodes.hitl_node import hitl_node

from app.graph.routers.main_router import main_router
from app.graph.routers.unified_router import unified_router

from app.tools import ALL_TOOLS
from app.memory.short_term import get_checkpointer


def build_graph():
    """
    Build and compile the LangGraph.

    Returns:
        Compiled graph with checkpointer
    """

    graph = StateGraph(GraphState)

    # ── Register Nodes ──────────────────────────────────────────
    graph.add_node("orchestrator", orchestrator_node)
    graph.add_node("finance_agent", finance_agent)
    graph.add_node("rag_agent", rag_agent)
    graph.add_node("guardrail_node", guardrail_node)
    graph.add_node("input_guardrail", input_guardrail_node)
    graph.add_node("output_guardrail", output_guardrail_node)
    graph.add_node("hitl_node", hitl_node)
    graph.add_node("tool_node", ToolNode(ALL_TOOLS))

    # ── Entry (Safety First) ──────────────────────────────────────
    graph.set_entry_point("input_guardrail")

    # ── Input Guardrail → Orchestrator ───────────────────────────
    def input_guardrail_router(state: GraphState) -> str:
        """Route to orchestrator if input is safe, otherwise to guardrail_node."""
        return "orchestrator" if state.get("is_input_safe", True) else "guardrail_node"

    graph.add_conditional_edges(
        "input_guardrail",
        input_guardrail_router,
        {
            "orchestrator": "orchestrator",
            "guardrail_node": "guardrail_node",
        },
    )

    # ── Orchestrator → Agent ─────────────────────────────────────
    # main_router only returns registered node names
    graph.add_conditional_edges(
        "orchestrator",
        main_router,
        {
            "finance_agent": "finance_agent",
            "rag_agent": "rag_agent",
            "guardrail_node": "guardrail_node",
        },
    )

    # ── Guardrail → END ──────────────────────────────────────────
    graph.add_edge("guardrail_node", END)

    # ── Agents → unified_router (HITL check → tool → END) ─────────────────
    # unified_router returns: "hitl_node" | "tool_node" | END (=="__end__")
    graph.add_conditional_edges(
        "finance_agent",
        unified_router,
        {
            "hitl_node": "hitl_node",
            "tool_node": "tool_node",
            END: "output_guardrail", # Wrap output with safety
        },
    )

    graph.add_conditional_edges(
        "rag_agent",
        unified_router,
        {
            "hitl_node": "hitl_node",
            "tool_node": "tool_node",
            END: "output_guardrail", # Wrap output with safety
        },
    )

    # ── Output Guardrail → END ──────────────────────────────────
    graph.add_edge("output_guardrail", END)

    # ── Tool Node → back to correct agent ───────────────────────
    def tool_return_router(state: GraphState) -> str:
        """Route back after tool execution based on which agent is active."""
        agent = state.get("active_agent")
        if agent == AgentType.RAG:
            return "rag_agent"
        # default back to finance_agent
        return "finance_agent"

    graph.add_conditional_edges(
        "tool_node",
        tool_return_router,
        {
            "finance_agent": "finance_agent",
            "rag_agent": "rag_agent",
        },
    )

    # ── HITL → resume to tool_node or agent ─────────────────────────
    def hitl_return_router(state: GraphState) -> str:
        """Route after HITL: if approved, run tool; if rejected, agent responds."""
        if state.get("hitl_approved"):
            return "tool_node"
        # If rejected, we already appended ToolMessage, go back to agent
        agent = state.get("active_agent")
        return "rag_agent" if agent == AgentType.RAG else "finance_agent"

    graph.add_conditional_edges(
        "hitl_node",
        hitl_return_router,
        {
            "tool_node": "tool_node",
            "finance_agent": "finance_agent",
            "rag_agent": "rag_agent",
        },
    )

    # ── Memory ───────────────────────────────────────────────────
    checkpointer = get_checkpointer()

    return graph.compile(checkpointer=checkpointer)