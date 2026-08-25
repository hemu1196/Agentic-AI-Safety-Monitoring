# Agentic AI Safety Monitoring With Construction Risk Analytics

### Unreal Engine 5.x Construction Site Digital Twin & Safety Visualization Platform

[![Unreal Engine](https://img.shields.io/badge/Unreal%20Engine-5.3%2B-blue?logo=unrealengine)](https://www.unrealengine.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-green?logo=python)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.28%2B-red?logo=streamlit)](https://streamlit.io/)
[![License](https://img.shields.io/badge/License-MIT-purple)](#license)

---

## 1. Project Overview & Objectives

**Agentic AI Safety Monitoring With Construction Risk Analytics** is an industrial construction-site intelligence platform combining a high-fidelity **Unreal Engine 5.x 3D Digital Twin**, an **Agentic AI & Computer Vision Python Backend**, and an interactive **Streamlit Executive Dashboard**.

This is **NOT a game**. It is an enterprise 3D visualization layer for industrial safety monitoring, worker protection, risk scoring, compliance auditing, and insurance risk analytics.

```
                    UNREAL ENGINE 5.x
                Construction Digital Twin
                           ↕
                 REST API / WebSockets
                (Port 8000 / Bridge)
                           ↕
                        PYTHON
            AI + Computer Vision + Analytics
                           ↕
                       STREAMLIT
                 Intelligence Dashboard
```

---

## 2. Platform Architecture & Data Flow

- **Unreal Engine 5.x (`Unreal/ConstructionIntelligenceTwin/`)**:
  - 3D Construction Site Digital Twin (7 Zones, 43 Workers, Tower Crane, Excavator, Storage Yard).
  - Autonomous Inspection Drone (`DRONE-01`) patrolling site waypoints.
  - 5 CCTV Cameras (`CCTV-01` to `CCTV-05`).
  - Dynamic Risk Heatmap Visualization (Green: Low, Yellow: Medium, Orange: High, Red: Critical).
  - Dual Data Provider Pattern: `SimulatedDataProvider` (standalone demo) and `PythonRestProvider` (live Python API bridge).

- **Python AI & Vision Backend (`Python/`, `agentic_engine/`, `api_server.py`)**:
  - REST API Server on `http://localhost:8000`.
  - OpenCV & Computer Vision PPE hardhat & vest classifier with skin/background exclusion.
  - Autonomous Agentic Decision & Escalation Router (`agent/action_router.py`).
  - SQLite persistence (`safety_events.db`).

- **Streamlit Intelligence Dashboard (`app.py`, `app_modules/`)**:
  - 14 Tactical Modules including Executive Overview, Entry Gate, Live Surveillance, Safety Analytics, Drone AI PPE Safety, 3D WebGL Digital Twin, What-If Site Simulator, and Risk Predictor.

---

## 3. Master Repository Structure

```
Agentic-AI-Safety-Monitoring/
│
├── Unreal/
│   └── ConstructionIntelligenceTwin/
│       ├── ConstructionIntelligenceTwin.uproject  # UE 5.3+ Project Descriptor
│       ├── Config/                                # Engine, Game, and Input configs
│       │   ├── DefaultEngine.ini
│       │   ├── DefaultGame.ini
│       │   └── DefaultInput.ini
│       ├── Source/                                # Clean C++ Architecture
│       │   └── ConstructionIntelligenceTwin/
│       │       ├── Core/                          # ConstructionGameMode
│       │       ├── Data/                          # IDataProviderInterface, Simulated & Python Providers
│       │       ├── Zones/                         # ConstructionZoneManager
│       │       ├── Workers/                       # WorkerVisualizer
│       │       ├── Drone/                         # InspectionDroneController
│       │       ├── Risk/                          # RiskHeatmapManager
│       │       └── UI/                            # IndustrialDashboardHUD
│       └── Content/
│           ├── Maps/                              # ConstructionSite_Main.umap
│           └── Data/                              # InitialSiteData.json
│
├── Python/
│   ├── backend/                                   # REST Server & unreal_bridge.py
│   ├── ai/                                        # agentic_engine (Rules, Action Router)
│   └── dashboard/                                 # Streamlit app & modules
│
├── Documentation/
│   ├── architecture/                              # System Architecture Specification
│   ├── milestone-1/                               # Environment & Site Zones Specs
│   ├── milestone-2/                               # Python-Unreal REST Bridge Specs
│   └── milestone-3/                               # Agentic Risk Simulation Engine Specs
│
├── Screenshots/                                   # Application Screenshots
├── Demo/                                          # Step-by-step Demonstration Scenario
├── .gitignore                                     # Excludes UE5 build caches (Binaries, Saved, etc.)
├── .gitattributes                                 # Git LFS tracking
└── README.md
```

---

## 4. Key Features

- **7 Clearly Identifiable Site Zones**:
  - `ZONE_A_ENTRANCE` (Site Entrance Gate)
  - `ZONE_B_BUILDING` (Main Construction Building)
  - `ZONE_C_CRANE` (Tower Crane Operations)
  - `ZONE_D_EXCAVATION` (Deep Trench Excavation Zone)
  - `ZONE_E_STORAGE` (Steel & Rebar Material Storage)
  - `ZONE_F_EQUIPMENT` (Heavy Machinery Yard)
  - `ZONE_G_RESTRICTED` (High Voltage Hazard Area)

- **43 Simulated Workers (W001 - W043)**:
  - Role, position, current zone, helmet status, vest status, harness status, risk level, violation history, and corrective action status.

- **Autonomous Inspection Drone (`DRONE-01`)**:
  - Smooth waypoint flight pathing (`BASE` -> `ZONE_A` -> `ZONE_B` -> `ZONE_C` -> `ZONE_D` -> `ZONE_E` -> `BASE`) with real-time HUD telemetry (Altitude, Speed, Battery, Current Zone).

- **5 CCTV Surveillance Cameras (`CCTV-01` to `CCTV-05`)**:
  - Strategic coverage of entrance, main structure, crane zone, excavation pit, and material storage yard.

- **Dynamic Risk Heatmaps & Insurance Analytics**:
  - Calculates Insurance Risk (Worker Risk, Equipment Risk, Site Risk, Compliance Risk, Incident Risk).
  - Updates zone 3D materials dynamically (Green: Low 0-30, Yellow: Medium 31-60, Orange: High 61-80, Red: Critical 81-100).

- **Interactive Simulation Mode**:
  - Trigger PPE violations (`SIMULATE PPE VIOLATION`) and resolve violations (`RESOLVE VIOLATION`) in real time.

---

## 5. Controls Mapping

| Key / Action | Action Name | Function |
|---|---|---|
| **`1`** | `Cam_Overview` | Switch to 3D Site Overview Camera |
| **`2`** | `Cam_DroneFPV` | Switch to Inspection Drone FPV Camera |
| **`3`** | `Cam_CCTV` | Switch to CCTV Camera Viewer |
| **`4`** | `Cam_WorkerInspector` | Switch to Selected Worker Inspection Camera |
| **`P`** | `Simulate_PPE_Violation` | Trigger Simulated PPE Violation (Worker W018) |
| **`R`** | `Resolve_Violation` | Trigger Corrective Action Resolution |
| **`S`** | `Toggle_Simulation_Mode` | Toggle between Autonomous Simulation & Live Python API |

---

## 6. How to Open & Run the Project

### Option A: Running Unreal Engine 5.x Project
1. Open Unreal Engine 5.3 or newer.
2. Select **Open Project** and browse to `Unreal/ConstructionIntelligenceTwin/ConstructionIntelligenceTwin.uproject`.
3. Press **Play (PIE)** to launch the 3D Construction Digital Twin.
4. Press `P` to simulate a PPE violation, `R` to resolve, or keys `1`-`4` to switch cameras.

### Option B: Running Python REST Server & Streamlit Dashboard
```bash
# 1. Start Python REST Server & Unreal Bridge (Port 8000)
python3 api_server.py

# 2. Launch Streamlit Intelligence Dashboard
streamlit run app.py
```

---

## 7. Demonstration Scenario Walkthrough

The platform demonstrates a complete closed-loop safety pipeline:

1. **Launch Unreal Digital Twin**: Drone `DRONE-01` begins autonomous site patrol. Baseline Compliance: `91%`, Site Risk: `42`.
2. **Trigger Simulation (`Key P`)**: Worker `W018` loses helmet in `ZONE_C_CRANE`.
3. **Visual Alert**: Worker `W018` 3D indicator turns **RED** (`WEAR HELMET!`). Crane Zone risk spikes to **95** (`CRITICAL`) with glowing red heatmap.
4. **Event Log & Risk Escalation**: Real-time event log shows `RED ALERT: Worker W018 Helmet missing in Crane Zone`. Compliance drops to `79%`, Insurance Risk rises to `84`.
5. **Agentic AI Directives**: Agentic AI recommends: *"Block entry gate barrier arm, sound audio siren, dispatch supervisor."*
6. **Trigger Resolution (`Key R`)**: Worker `W018` equips helmet (`VERIFIED`).
7. **Risk Recalculation**: Crane Zone risk drops to `35` (Medium). Compliance returns to `92%`, Site Risk improves to `42`.

```
DETECTION -> COMPLIANCE -> RISK -> INCIDENT -> CORRECTIVE ACTION -> VERIFICATION -> RISK IMPROVEMENT
```

---

## 8. License & Credits

- **License**: MIT License
- **Author**: Hema Chandra (`hemu1196`)
- **Repository**: [github.com/hemu1196/construction-intelligence-hub](https://github.com/hemu1196/construction-intelligence-hub)
