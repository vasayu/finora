"""
validate_tools.py

Purpose:
--------
Validates tool definitions at startup.

Why this matters:
-----------------
- Prevents malformed tools from breaking agent loop
- Ensures all tools follow LangChain interface
"""

from langchain_core.tools import BaseTool
from typing import List
from loguru import logger


def validate_tools(tools: List[BaseTool]) -> None:
    """
    Validate all tools.

    Args:
        tools (List[BaseTool]): Tools to validate

    Raises:
        ValueError: If invalid tool found
    """

    for tool in tools:

        if not isinstance(tool, BaseTool):
            raise ValueError(f"Invalid tool: {tool}")

        if not tool.name or not tool.description:
            raise ValueError(f"Tool missing metadata: {tool}")

        logger.info(f"✅ Tool validated: {tool.name}")