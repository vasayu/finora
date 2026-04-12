"""
hitl.py

Purpose:
--------
Resume a paused (interrupted) LangGraph thread after human approval.

Supports two interrupt types:
  - large_transaction:      choice = 'yes' | 'no'
  - categorize_transaction: choice = e.g. 'Food & Dining'
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class ResumeRequest(BaseModel):
    session_id: str
    # Legacy bool field (kept for backward compat)
    approved: Optional[bool] = None
    # New: free-form choice string ('yes', 'no', category name, etc.)
    choice: Optional[str] = None
    # interrupt_type lets the node know how to interpret the choice
    interrupt_type: Optional[str] = "large_transaction"


@router.post("/hitl/resume")
async def resume(request: ResumeRequest):
    """
    Resume graph after human approval or rejection.

    The frontend sends:
      - choice: 'yes' / 'no' for large_transaction
      - choice: 'Food & Dining' / etc. for categorize_transaction
      - interrupt_type: so the node can interpret choice correctly

    Returns:
        dict: Final response after resumption
    """
    from main import graph

    # Resolve choice: prefer new `choice` field, fall back to legacy `approved` bool
    if request.choice is not None:
        hitl_choice = request.choice
    elif request.approved is not None:
        hitl_choice = "yes" if request.approved else "no"
    else:
        hitl_choice = "no"

    config = {
        "configurable": {
            "thread_id": request.session_id,
            "hitl_choice": hitl_choice,
        }
    }

    # Also store interrupt_type into state so hitl_node can branch correctly
    # We do this via a state update before resuming
    try:
        current_state = await graph.aget_state(config)
        state_values = current_state.values if current_state else {}
        interrupt_type = request.interrupt_type or state_values.get("hitl_interrupt_type", "large_transaction")

        # Patch interrupt_type into config so hitl_node reads it from state
        # (LangGraph state update via update_state before resume)
        await graph.aupdate_state(
            config,
            {"hitl_interrupt_type": interrupt_type},
        )

        result = await graph.ainvoke(None, config=config)
        messages = result.get("messages", [])
        final_message = messages[-1].content if messages else ""

        return {
            "status": "resumed",
            "answer": final_message,
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }