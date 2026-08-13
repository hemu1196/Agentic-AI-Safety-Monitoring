"""
Agentic Safety Engine — the layer described in the spec's "Agentic Workflow":

    EVENT -> check policy -> assess severity -> select response
    (inform / warn / escalate / request human verification) -> write incident
    -> notify dashboard -> await acknowledgement

This module is intentionally simple rule-based logic for the MVP — a real
"agent" here means structured, explainable decision-making, not necessarily
an LLM call. It can be swapped for an LLM-backed reasoner later without
changing the interface (route_event stays the same signature).
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List


@dataclass
class AgentDecision:
    worker_id: int
    event_type: str          # e.g. "no_helmet", "no_vest"
    severity: str             # "warning" | "high" | "critical"
    recommended_action: str
    reasoning_summary: str
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


def route_event(worker_id, violation: dict, repeat_count: int = 1) -> AgentDecision:
    """Takes one violation dict (from ppe_rules.evaluate_ppe) and decides
    the recommended action, escalating if the same violation has repeated.
    """
    v_type = violation["type"]
    severity = violation["severity"]
    action = violation["action"]

    reasoning = f"Worker #{worker_id} triggered '{v_type}' (severity: {severity})."

    # Escalation logic: repeated violations bump severity and action
    if repeat_count >= 3 and severity != "critical":
        severity = "critical"
        action = "Escalate to safety lead — repeated violation."
        reasoning += f" Repeated {repeat_count}x — escalating."

    return AgentDecision(
        worker_id=worker_id,
        event_type=v_type,
        severity=severity,
        recommended_action=action,
        reasoning_summary=reasoning,
    )


def route_all(worker_id, violations: List[dict], repeat_counts: dict = None) -> List[AgentDecision]:
    repeat_counts = repeat_counts or {}
    decisions = []
    for v in violations:
        count = repeat_counts.get(v["type"], 1)
        decisions.append(route_event(worker_id, v, repeat_count=count))
    return decisions
