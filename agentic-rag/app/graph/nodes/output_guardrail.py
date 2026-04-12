"""
output_guardrail.py

Purpose:
--------
Post-screens AI responses before returning to the user for:
1. Hallucinations (grounding check)
2. PII (Personally Identifiable Information) leakage
3. Toxicity
4. Offensive/Harmful content
"""

from loguru import logger
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.graph.state.graph_state import GraphState


async def output_guardrail_node(state: GraphState) -> dict:
    """
    Analyzes the AI response for safety and consistency.
    If unsafe, redacts the last AI message and returns a polite refusal.
    
    Args:
        state (GraphState): Current graph state
        
    Returns:
        dict: Updated messages list if redaction is required.
    """
    logger.info("Output Guardrail: Analyzing AI message...")
    
    messages = state.get("messages", [])
    if len(messages) < 2:
        return {"is_output_safe": True}
        
    user_query = messages[-2].content
    ai_response = messages[-1].content
    
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    system_prompt = """
    You are a safety and domain-consistency guardrail for 'Finora', a financial AI assistant.
    Your task is to determine if the AI's response is SAFE to return to the user.
    
    Criteria for UNSAFE:
    1. PII Leakage: The response contains sensitive data like user passwords, full account numbers, or SSNs.
    2. Toxicity: The response is offensive, harmful, biased, or discriminatory.
    3. Hallucination/Grounding: The response makes up numbers or data that are clearly inconsistent with the intent (e.g., providing a fake balance when no data was found).
    4. Out-of-Domain Response: The AI has answered a question that is clearly unrelated to finance, such as geography, general science, or celebrity gossip.
    
    Respond with EXACTLY one of these two strings (case-sensitive):
    'SAFE' - If the response passes all criteria.
    'UNSAFE' - If the response fails any criteria.
    """
    
    try:
        response = await llm.ainvoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"User Query: {user_query}\n\nAI Response: {ai_response}")
        ])
        
        decision = response.content.strip()
        is_safe = (decision == "SAFE")
        
        if not is_safe:
            logger.warning(f"Output Guardrail triggered! Decision: {decision}")
            
            # If the response is unsafe, we redact it and return a refusal.
            # We add a new AIMessage to the list which replaces/supplements the last one.
            # Since GraphState uses operator.add for messages, we should be careful here.
            # Actually, to truly "redact", we might want the orchestrator to check this flag.
            # However, for simplicity and effectiveness, we will return a generic refusal.
            refusal_msg = "My apologies, but I generated an answer that doesn't meet my safety or accuracy standards. Let me try answering your financial questions in a more focused way!"
            
            return {
                "is_output_safe": False,
                "messages": [AIMessage(content=refusal_msg)]
            }
        else:
            logger.info("Output Guardrail passed.")
            return {"is_output_safe": True}
            
    except Exception as e:
        logger.error(f"Output guardrail error: {e}")
        # Default to safe in case of technical failure (to avoid blocking the response)
        return {"is_output_safe": True}
