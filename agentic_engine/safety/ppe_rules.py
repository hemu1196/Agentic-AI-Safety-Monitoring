"""
Safety Rule Engine — PPE compliance.
Mirrors the "Safety Rule Engine" table in the project spec.
"""

import config


def evaluate_ppe(ppe_status: dict):
    """Given {"helmet": bool, "vest": bool, ...}, returns:

    decision: "PASS" or "BLOCK"
    missing_items: list of required items not detected, e.g. ["helmet"]
    compliance_pct: float 0-100, fraction of ALL tracked items present
                     (not just required ones, for the analytics view)
    violations: list of (violation_type, severity, recommended_action)
    """
    missing_items = [
        item for item in config.REQUIRED_PPE if not ppe_status.get(item, False)
    ]
    decision = "BLOCK" if missing_items else "PASS"

    total_items = len(ppe_status) or 1
    present_items = sum(1 for v in ppe_status.values() if v)
    compliance_pct = round(100 * present_items / total_items, 1)

    violations = []
    for item in missing_items:
        v_type = f"no_{item}"
        severity = config.SEVERITY_TABLE.get(v_type, "medium")
        action = config.RECOMMENDED_ACTION.get(v_type, "Log and review.")
        violations.append({"type": v_type, "severity": severity, "action": action})

    return {
        "decision": decision,
        "missing_items": missing_items,
        "compliance_pct": compliance_pct,
        "violations": violations,
    }
