"""
types.py

Purpose:
--------
Defines enums and shared types used in the graph.

Why this matters:
-----------------
- Standardizes agent selection
- Prevents string mismatch bugs
- Central control of system agents
"""

from enum import Enum


class AgentType(str, Enum):
    """
    All available agents in the system.
    """

    ORCHESTRATOR = "orchestrator"
    FINANCE = "finance"
    RAG = "rag"
    ANALYTICS = "analytics"
    VALIDATION = "validation"
    GUARDRAIL = "guardrail"