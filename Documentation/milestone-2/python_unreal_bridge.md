# Milestone 2: Python & Unreal Engine Communication Bridge

## Overview
The communication bridge connects Unreal Engine 5.x with the Python AI Backend via HTTP/REST endpoints.

## REST API Specification

### 1. Site State Polling Endpoint
- **URL**: `GET http://localhost:8000/api/v1/unreal/site-state`
- **Response Format**:
```json
{
  "status": "success",
  "timestamp": "14:32:11",
  "site_overview": {
    "workers": 43,
    "active_hazards": 7,
    "compliance_pct": 87.0,
    "site_risk": 72.0,
    "insurance_risk": 69.0,
    "drone_status": "PATROLLING"
  },
  "workers": [
    {
      "worker_id": "W018",
      "role": "Labourer",
      "zone": "ZONE_C_CRANE",
      "helmet": false,
      "vest": true,
      "harness": false,
      "risk_level": 3,
      "violations": 4,
      "action_status": "OPEN"
    }
  ]
}
```

### 2. Simulation Event Trigger Endpoint
- **URL**: `POST http://localhost:8000/api/v1/unreal/simulate-event`
- **Payload**:
```json
{
  "event_type": "PPE_VIOLATION",
  "worker_id": "W018",
  "zone": "ZONE_C_CRANE"
}
```
