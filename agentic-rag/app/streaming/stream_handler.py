"""
stream_handler.py

Purpose:
--------
Streams LangGraph execution as structured events.

Why this matters:
-----------------
- Converts raw graph output into UI-friendly events
- Enables real-time visualization
"""

from typing import AsyncGenerator
from loguru import logger

from app.streaming.events import agent_event, tool_event, final_event


async def stream_graph(graph, inputs: dict) -> AsyncGenerator[dict, None]:
    """
    Stream LangGraph execution with structured events.

    Args:
        graph: Compiled LangGraph
        inputs (dict): Initial graph state

    Yields:
        dict: Structured event
    """

    logger.info("Starting structured streaming...")

    async for step in graph.astream(inputs):

        for node_name, value in step.items():

            # Agent execution event
            if "agent" in node_name:
                yield agent_event(node_name)

            # Tool execution event
            if node_name == "tool_node":
                yield tool_event("tool_execution")

            # Final output detection
            if isinstance(value, dict) and "messages" in value:
                messages = value["messages"]
                if messages:
                    last_msg = messages[-1]
                    content = getattr(last_msg, "content", None)

                    if content:
                        yield final_event(content)

    logger.info("Streaming completed")