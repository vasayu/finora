"""
planner.py

Purpose:
--------
Decides which agent should handle the user query.

Why this matters:
-----------------
- Core intelligence routing layer
- Enables multi-agent architecture
- Keeps workers simple and focused
"""

from loguru import logger
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage

from app.graph.state.types import AgentType


async def plan_agent(messages: list[BaseMessage]) -> AgentType:
    """
    Determine which agent should handle the request.

    Args:
        messages (list[BaseMessage]): Conversation history

    Returns:
        AgentType: Selected agent
    """

    logger.info("Planning next agent...")

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
    )

    # System instruction for routing
    system_prompt = """
You are an AI router for a financial system.

Your task is to classify the user's request into exactly ONE of the following agents:

1. FINANCE → For ADDING, CREATING, or LOGGING new transactions. Also for QUERYING, VIEWING, or ASKING ABOUT past transactions, spending history, balances, income, expenses, or any live financial data from the database.
2. RAG → For SEARCHING the content of uploaded documents, files, PDFs, invoices, receipts, statements, or reports that the user has previously uploaded.
3. ANALYTICS → For insights, summaries, trends, reports, statistics
4. VALIDATION → For checking correctness, safety, or verifying outputs
5. GUARDRAIL → For anything NOT related to personal finance, wealth management, transactions, or financial analysis. This includes general knowledge (geography, history, science), casual conversation (jokes, greetings, how are you?), or non-financial advice.

---

Examples:

User: "Add an expense of 500 for food"
Output: FINANCE

User: "Tell me about my recent transactions"
Output: FINANCE

User: "What does my uploaded invoice say?"
Output: RAG

User: "Show me my spending trends"
Output: ANALYTICS

User: "What is the capital of India?"
Output: GUARDRAIL

User: "Tell me a joke"
Output: GUARDRAIL

User: "How's the weather today?"
Output: GUARDRAIL

---

Rules:
- Respond with ONLY ONE word from: FINANCE, RAG, ANALYTICS, VALIDATION, GUARDRAIL
- Do NOT explain
- Do NOT output anything else
- When in doubt between FINANCE and RAG, choose FINANCE
- If the request is clearly unrelated to money or finances, choose GUARDRAIL

Answer:
"""

    # Combine system + user messages
    response =await llm.invoke([
        {"role": "system", "content": system_prompt},
        *messages
    ])

    decision = response.content.strip().upper()

    logger.info(f"Planner decision: {decision}")

    # Map to enum
    try:
        return AgentType[decision]
    except KeyError:
        logger.warning("Invalid agent, defaulting to FINANCE")
        return AgentType.FINANCE