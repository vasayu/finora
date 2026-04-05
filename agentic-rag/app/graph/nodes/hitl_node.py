"""
hitl_node.py

Purpose:
--------
Human-in-the-loop node that pauses graph execution for approval.

Interrupt types:
  - large_transaction:     User confirms/rejects a high-value action (Yes / No)
  - categorize_transaction: User picks a spending category from a list of options

On resume the human's choice arrives via config['configurable']['hitl_choice']:
  - large_transaction:     'yes' → approved,  anything else → rejected
  - categorize_transaction: e.g. 'Food & Dining' → injected back into tool args

Fix:
----
- Uses LangGraph v0.2 `GraphInterrupt` API
- Returns mock ToolMessage on rejection so OpenAI strict validation doesn't crash
- Mutates pending tool_call args with chosen category before handing off to tool_node
"""

from loguru import logger
from langgraph.errors import GraphInterrupt
from langchain_core.messages import ToolMessage, AIMessage
from langchain_core.runnables.config import RunnableConfig

from app.graph.state.graph_state import GraphState

HITL_AMOUNT_THRESHOLD = 10000

TRANSACTION_CATEGORIES = [
    "Food & Dining",
    "Transport",
    "Shopping",
    "Healthcare",
    "Utilities",
    "Entertainment",
    "Salary / Income",
    "Investments",
    "Rent / Housing",
    "Other",
]


def _detect_interrupt_type(state: GraphState) -> tuple[str, dict]:
    """Inspect the pending tool call and decide what kind of interrupt to raise."""
    messages = state.get("messages", [])
    if not messages:
        return "large_transaction", {}

    last = messages[-1]
    if not (hasattr(last, "tool_calls") and last.tool_calls):
        return "large_transaction", {}

    tc = last.tool_calls[0]
    args = tc.get("args", {})
    amount = args.get("amount")
    category = args.get("category", "").strip()

    if amount and float(amount) > HITL_AMOUNT_THRESHOLD:
        return "large_transaction", {
            "amount": float(amount),
            "description": args.get("description", ""),
            "tool_name": tc.get("name", ""),
        }

    if not category:
        return "categorize_transaction", {
            "description": args.get("description", ""),
            "amount": float(amount) if amount else None,
            "options": TRANSACTION_CATEGORIES,
        }

    return "large_transaction", {}


def hitl_node(state: GraphState, config: RunnableConfig) -> dict:
    """
    Pause execution and wait for human input.

    First pass:  raise GraphInterrupt (UI shows buttons)
    Second pass: read hitl_choice from config, act accordingly
    """
    hitl_choice = config.get("configurable", {}).get("hitl_choice")

    if hitl_choice is None:
        # ── First pass: decide what to ask the human ──────────────
        interrupt_type, metadata = _detect_interrupt_type(state)

        logger.warning(f"HITL triggered – type={interrupt_type}, meta={metadata}")

        payload = {
            "interrupt_type": interrupt_type,
            "metadata": metadata,
            "message": (
                "This transaction is above the approval threshold. Do you want to proceed?"
                if interrupt_type == "large_transaction"
                else "Please select a category for this transaction."
            ),
        }
        if interrupt_type == "categorize_transaction":
            payload["options"] = TRANSACTION_CATEGORIES

        raise GraphInterrupt(payload)

    # ── Second pass: human has responded ──────────────────────────
    interrupt_type = state.get("hitl_interrupt_type", "large_transaction")
    logger.info(f"HITL resumed – type={interrupt_type}, choice={hitl_choice!r}")

    # ── large_transaction  ─────────────────────────────────────────
    if interrupt_type == "large_transaction":
        approved = hitl_choice.lower() in ("yes", "true", "approve", "approved")

        if not approved:
            logger.warning("HITL Rejected — injecting cancellation ToolMessage")
            messages = state.get("messages", [])
            fake_msgs = []
            if messages:
                last = messages[-1]
                if hasattr(last, "tool_calls") and last.tool_calls:
                    for tc in last.tool_calls:
                        fake_msgs.append(
                            ToolMessage(
                                tool_call_id=tc["id"],
                                name=tc["name"],
                                content="Action REJECTED by human security override. Do not attempt again.",
                            )
                        )
            return {
                "messages": fake_msgs,
                "hitl_approved": False,
                "hitl_choice": hitl_choice,
            }

        logger.info("HITL Approved — proceeding to tool_node")
        return {"hitl_approved": True, "hitl_choice": hitl_choice}

    # ── categorize_transaction ─────────────────────────────────────
    # Patch the pending AI message's tool call with the chosen category
    messages = list(state.get("messages", []))
    patched_msgs = []

    for msg in reversed(messages):
        if hasattr(msg, "tool_calls") and msg.tool_calls:
            # Deep-copy the tool_calls and inject chosen category
            new_tool_calls = []
            for tc in msg.tool_calls:
                new_args = dict(tc.get("args", {}))
                new_args["category"] = hitl_choice
                new_tc = dict(tc)
                new_tc["args"] = new_args
                new_tool_calls.append(new_tc)

            # Rebuild AIMessage with patched tool calls
            patched = AIMessage(
                content=msg.content,
                tool_calls=new_tool_calls,
                id=getattr(msg, "id", None),
            )
            # Replace the old message in the list
            idx = messages.index(msg)
            messages[idx] = patched
            logger.info(f"Category '{hitl_choice}' injected into tool call args")
            break

    return {
        "messages": messages,
        "hitl_approved": True,
        "hitl_choice": hitl_choice,
        "hitl_interrupt_type": interrupt_type,
    }