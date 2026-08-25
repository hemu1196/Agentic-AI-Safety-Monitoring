# Master System Architecture

## Agentic AI Safety Monitoring With Construction Risk Analytics

This document details the end-to-end architecture of the platform, combining an **Unreal Engine 5.x 3D Digital Twin**, **Python AI/Vision Analytics Backend**, and **Streamlit Intelligence Dashboard**.

```
                   UNREAL ENGINE 5.x
              Construction Digital Twin
                       ↕
               REST API / WebSockets
                (Port 8000 / Bridge)
                       ↕
                    PYTHON
        AI + Computer Vision + Risk Engine
                       ↕
                   STREAMLIT
             Intelligence Dashboard
```

---

## Component Specifications

### 1. Unreal Engine 5.x (`Unreal/ConstructionIntelligenceTwin/`)
- **Engine Version**: Unreal Engine 5.3+
- **Project Structure**: Clean C++ architecture with Blueprint extensibility (`.uproject`)
- **Key Modules**:
  - `Core/ConstructionGameMode`: Main orchestration game mode supporting 4 camera modes (1: Overview, 2: Drone FPV, 3: CCTV, 4: Worker Inspector).
  - `Data/IDataProviderInterface`: Data abstraction layer enabling seamless execution under both **`SimulatedDataProvider`** (standalone UI/UE demo) and **`PythonRestProvider`** (live Python synchronization).
  - `Zones/ConstructionZoneManager`: Manages 7 designated site zones (`ZONE_A`..`ZONE_G`) with dynamic risk heatmaps.
  - `Workers/WorkerVisualizer`: Manages 3D indicators, floating HUD panels, helmet/vest status, and role badges for workers W001 to W043.
  - `Drone/InspectionDroneController`: Patrols drone waypoints (`BASE` -> `ZONE_A` -> `ZONE_B` -> `ZONE_C` -> `ZONE_D` -> `ZONE_E` -> `BASE`) and emits HUD telemetry.
  - `Risk/RiskHeatmapManager`: Evaluates insurance risk metrics and updates zone material colors.
  - `UI/IndustrialDashboardHUD`: Top telemetry bar, event feed, worker/zone inspection panels, insurance risk breakdown, and AI recommendations.

---

### 2. Python Backend & Agentic Engine (`Python/backend/`, `Python/ai/`)
- **REST Server (`api_server.py`)**: Runs on `http://localhost:8000` serving endpoints:
  - `GET /health`: Service health check.
  - `POST /predict`: Risk ML prediction endpoint.
  - `GET /api/v1/unreal/site-state`: Unreal Engine state polling interface.
  - `POST /api/v1/unreal/simulate-event`: Real-time event simulation trigger.
- **Agentic Engine (`agentic_engine/`)**:
  - `safety/ppe_rules.py`: PPE rules engine (Helmet, Vest, Harness).
  - `agent/action_router.py`: Autonomous Agentic Decision & Escalation Router.
  - `database/db.py`: SQLite persistence (`safety_events.db`).

---

### 3. Streamlit Intelligence Dashboard (`Python/dashboard/`, `app.py`)
- **14 Tactical Modules**: Executive Overview, Entry Gate, Live Surveillance, Safety Analytics, Site Risk Detection, Worker Protection, Drone AI PPE Safety, Insurance Compliance, EDA Studio, ML Pipeline Benchmark, Risk Predictor, 3D Digital Twin, Batch CSV Predictor, What-If Site Simulator.
