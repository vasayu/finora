"""
graph_state.py

Purpose:
--------
Defines global state for LangGraph (multi-agent ready).

Fix:
----
- messages uses Annotated + operator.add so LangGraph appends (not overwrites)
"""

import operator
from typing import TypedDict, Annotated, List, Optional, Any, Dict
from langchain_core.messages import BaseMessage
from app.graph.state.types import AgentType


class GraphState(TypedDict, total=False):
    """
    Global graph state.

    Fields:
    -------
    messages: Conversation history (auto-appended by LangGraph)
    active_agent: Currently selected agent
    user_id: Injected from API for tool calls
    """

    # ✅ Critical: Annotated reducer prevents overwrite bugs
    messages: Annotated[List[BaseMessage], operator.add]

    # Multi-agent control
    active_agent: Optional[AgentType]

    # Routing control
    next_node: Optional[str]

    # HITL state
    hitl_approved: Optional[bool]

    # HITL interrupt type: 'large_transaction' | 'categorize_transaction'
    hitl_interrupt_type: Optional[str]

    # Available options for category-style interrupts
    hitl_options: Optional[List[str]]

    # The human's chosen option (free-form string — category name or 'yes'/'no')
    hitl_choice: Optional[str]

    # Extra metadata attached to the interrupt (amount, description, etc.)
    hitl_metadata: Optional[Dict[str, Any]]

    # User context (injected once at entry, propagated to tools)
    user_id: Optional[str]

    # Safety Guardrail status
    is_input_safe: Optional[bool]
    is_output_safe: Optional[bool]