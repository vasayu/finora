"""
llm_with_tools.py

Purpose:
--------
Returns a tool-bound LLM instance.
Uses ALL_TOOLS so every agent can call finance + rag tools.
"""

from langchain_openai import ChatOpenAI
from app.tools import ALL_TOOLS
from loguru import logger


def get_llm_with_tools() -> ChatOpenAI:
    """
    Create and return a tool-enabled LLM.

    Returns:
        ChatOpenAI: LLM with tools bound
    """
    logger.info(f"Binding {len(ALL_TOOLS)} tools to LLM")

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    return llm.bind_tools(ALL_TOOLS)