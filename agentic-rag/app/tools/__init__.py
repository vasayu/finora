"""
tools/__init__.py

Purpose:
--------
Central registry for all tools.

Fix:
----
- Corrected validate_tools import path (was tools.utils, now app.utils)
- Added FINANCE_TOOLS to ALL_TOOLS
"""

from app.tools.rag import RAG_TOOLS
from app.tools.finance import FINANCE_TOOLS
from app.utils.validate_tools import validate_tools

# Combine all tool groups
ALL_TOOLS = [
    *RAG_TOOLS,
    *FINANCE_TOOLS,
]

# Validate at startup
validate_tools(ALL_TOOLS)