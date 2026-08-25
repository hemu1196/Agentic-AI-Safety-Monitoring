# Milestone 3: Agentic AI & Risk Simulation Engine

## Overview
The Agentic AI Safety Engine continuously evaluates worker telemetry, Computer Vision detection logs, and equipment certificates to classify site risk and auto-generate corrective action directives.

```
DETECTION -> COMPLIANCE -> RISK -> INCIDENT -> CORRECTIVE ACTION -> VERIFICATION -> RISK IMPROVEMENT
```

## Risk Metric Formula
- **Worker Risk**: Derived from individual worker PPE status, zone hazard levels, and historical violation frequency.
- **Equipment Risk**: Calculated from heavy machinery inspection dates, operating hours, and vibration telemetry.
- **Site Risk**: Weighted average of all 7 site zone risk scores.
- **Compliance Risk**: `100.0 - Overall Site Compliance %`.
- **Incident Risk**: Calculated from active open incident severity and escalation count.
- **Overall Insurance Risk**: `(Worker + Equipment + Site + Compliance + Incident) / 5`.

## Agentic AI Recommendation Engine
When a high-risk event triggers, the Agentic Action Router generates structured reasoning and field directives:
1. Identify high-risk worker and zone.
2. Formulate 4-point corrective action plan.
3. Notify site safety supervisor & dispatch drone inspection.
