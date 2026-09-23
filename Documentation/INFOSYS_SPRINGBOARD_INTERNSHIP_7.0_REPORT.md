# Infosys Springboard Virtual Internship 7.0

## Completion Report

---

### Team Details
> [!NOTE]
> Per privacy guidelines, no personally identifiable information (email, institute, phone numbers) is included.

- **Batch Number**: Batch 6.0 / 7.0 - AI & Software Engineering Track
- **Start Date**: July 2026
- **Names**: Hema Chandra (Team Lead & Full-Stack AI Engineer)
- **Internship Duration**: 8 Weeks

---

### 1. Project Title
**Agentic AI Safety Monitoring With Construction Risk Analytics**
*(Unreal Engine 5.x 3D Digital Twin, React + TypeScript Vite Command Center, FastAPI Microservices Backend & Streamlit Risk Analytics)*

---

### 2. Project Objective
The primary objective of this project is to develop an enterprise-grade, multi-layered industrial safety monitoring and risk analytics platform designed to eliminate occupational hazards on construction sites. 

By integrating **Computer Vision (CV)**, **Agentic AI Decision Engines**, **Unreal Engine 5.x 3D Digital Twins**, **React TypeScript Web Command Interfaces**, and **FastAPI Microservices**, the platform aims to:
- Perform real-time personal protective equipment (PPE) compliance auditing (Hardhats, High-Visibility Vests, Safety Harnesses).
- Automate security gate barrier arm access based on real-time clearance and clearance verification.
- Calculate multi-factor site and insurance risk scores (0–100 scale) across 7 designated site hazard zones.
- Deploy an autonomous inspection drone (`DRONE-01`) telemetry stream and CCTV surveillance network.
- Execute closed-loop corrective action workflows (**`OPEN` $\rightarrow$ `IN PROGRESS` $\rightarrow$ `RESOLVED` $\rightarrow$ `VERIFIED`**).
- Provide executive safety officers with interactive predictive risk modeling and real-time incident escalation.

---

### 3. Project Description in Detail

#### Technical Approach & Multi-Tiered Architecture
The platform is built on a decoupled, microservices-driven 4-tier architecture:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UNREAL ENGINE 5.x DIGITAL TWIN                       │
│    (3D Construction Site, Worker Visualizers, Drone FPV, CCTV Feeds)    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ REST / WebSocket (Port 8000)
┌────────────────────────────────────▼────────────────────────────────────┐
│                    FASTAPI PYTHON BACKEND & AGENTIC AI                  │
│   (SQLAlchemy 2.0 ORM, JWT Auth, Pydantic v2, Computer Vision Engine)   │
└──────────────────┬───────────────────────────────────┬──────────────────┘
                   │                                   │
┌──────────────────▼─────────────────┐       ┌─────────▼──────────────────┐
│      REACT + TYPESCRIPT COMMAND    │       │   STREAMLIT EXECUTIVE      │
│   (Vite, Tailwind CSS, 26 Modules) │       │   (3D WebGL, Analytics EDA)    │
└────────────────────────────────────┘       └────────────────────────────┘
```

1. **Frontend Command Portal (`src/`)**: Built using **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**. It includes 26 role-based dashboard pages catering to Site Supervisors, Safety Officers, and Field Workers.
2. **Backend Microservices (`backend/app/`)**: Powered by **FastAPI**, **SQLAlchemy 2.0 ORM**, **Pydantic v2**, and **PostgreSQL/SQLite**. It provides 16 REST API endpoints for user authentication, worker clearance, attendance logging, equipment tracking, and risk analytics.
3. **Computer Vision & Agentic AI Engine (`agentic_engine/`)**: Employs real-time image processing models to detect helmet/vest compliance, calculate worker risk factors, and automatically route high-priority safety directives.
4. **3D Digital Twin Engine (`Unreal/ConstructionIntelligenceTwin/`)**: Developed in **Unreal Engine 5.3+ C++**, featuring dual data providers (`SimulatedDataProvider` and `PythonRestProvider`), dynamic 3D zone heatmaps (Green, Yellow, Orange, Red), and drone patrol navigation.

#### Real-World Implementation Impact
- **Zero-Accident Site Enforcement**: Automated gate barriers prevent non-compliant workers from entering hazardous zones.
- **Dynamic Insurance Premium Optimization**: Risk scoring models provide insurance underwriters with verified site safety metrics, reducing liability premiums.
- **Proactive Risk Mitigation**: Autonomous AI recommendations alert safety managers before high-risk incidents escalate into casualties.

---

### 4. Timeline Overview

| Week | Planned Activities | Activities Completed | Status |
|---|---|---|---|
| **Week 1** | Requirement analysis, architectural design, and technology stack selection. | Defined monorepo layout, set up React + Vite frontend, and created core project schema. | **Completed** |
| **Week 2** | Database schema design and FastAPI backend ORM initialization. | Built SQLAlchemy 2.0 models, Pydantic schemas, and JWT authentication endpoints. | **Completed** |
| **Week 3** | Computer Vision PPE detection engine and camera feed integration. | Implemented hardhat and vest detection classifiers with skin/background exclusion. | **Completed** |
| **Week 4** | Agentic AI Action Router and automated safety escalation logic. | Built closed-loop corrective action workflow (`OPEN` $\rightarrow$ `VERIFIED`) and alert systems. | **Completed** |
| **Week 5** | React TypeScript Web Interface & 26 Management Pages development. | Implemented Executive Dashboard, Worker Entry Safety, Risk Analytics, and Site Maps. | **Completed** |
| **Week 6** | Unreal Engine 5.x 3D Construction Site Digital Twin C++ implementation. | Implemented 7 Site Zones, 43 Workers, Drone Telemetry Controller, and Risk Heatmaps. | **Completed** |
| **Week 7** | System integration, dual-data provider bridge, and REST API synchronization. | Linked UE5 C++ REST provider with FastAPI backend and Streamlit Executive Dashboard. | **Completed** |
| **Week 8** | End-to-end testing, bug fixing, documentation, and final report submission. | Executed full system verification, validated zero-syntax errors, and completed documentation. | **Completed** |

---

### 5a. Key Milestones

| Milestone Description | Date Achieved |
|---|---|
| **Project Kickoff & Architecture Approval** | Week 1 (July 10, 2026) |
| **Prototype / First Draft (FastAPI + Vision Engine)** | Week 3 (July 24, 2026) |
| **Mid-Term Review (Streamlit & React Portal Demo)** | Week 5 (August 7, 2026) |
| **Final Submission (Unreal Engine Twin & Full Integration)** | Week 7 (August 25, 2026) |
| **Presentation & Code Deployment** | Week 8 (September 9, 2026) |

---

### 5b. Project Execution Details

1. **System & Requirements Analysis**: Conducted OSHA compliance rule mapping to translate site regulations into programmatic decision logic.
2. **Backend Development (FastAPI + SQLAlchemy)**: Engineered 81 modular backend files implementing REST API routers (`auth`, `workers`, `safety`, `risks`, `compliance`, `sites`, `equipment`).
3. **Frontend Development (React + TypeScript + Vite)**: Developed 26 responsive pages featuring real-time telemetry widgets, status badges, and interactive site maps using Tailwind CSS.
4. **Unreal Engine 5 C++ Digital Twin**: Implemented C++ classes (`IDataProviderInterface`, `USimulatedDataProvider`, `UPythonRestProvider`, `AConstructionGameMode`, `ARiskHeatmapManager`) supporting camera views (`1`: Overview, `2`: Drone FPV, `3`: CCTV, `4`: Worker Inspector).
5. **Continuous Verification & Deployment**: Managed full version control using Git LFS and deployed source code to GitHub.

---

### 6. Snapshots / Screenshots

#### Fig 1: React TypeScript Executive Safety Dashboard (`src/pages/Dashboard.tsx`)
```
 ┌──────────────────────────────────────────────────────────────────────────────────────────┐
 │  AGENTIC AI SAFETY MONITORING | CONSTRUCTION RISK ANALYTICS               [ONLINE]       │
 ├───────────────────┬───────────────────┬───────────────────┬──────────────────────────────┤
 │ Active Workers: 43│ Active Hazards: 7 │ Site Risk: 72 HIGH│ Insurance Risk: 69 HIGH      │
 ├───────────────────┴───────────────────┴───────────────────┴──────────────────────────────┤
 │  [ 3D DIGITAL TWIN ]         [ ZONE RISK HEATMAP ]        [ REAL-TIME ALERT FEED ]       │
 │   Drone Patrol: ACTIVE        ZONE C (Crane): 95 CRITICAL  [14:32] Worker W018 Helmet Loss│
 └──────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Fig 2: Security Gate Worker Safety Clearance (`src/pages/WorkerEntrySafety.tsx`)
```
 ┌──────────────────────────────────────────────────────────────────────────────────────────┐
 │  ENTRY GATE SAFETY CLEARANCE BARRIER CONTROLLER                                           │
 ├───────────────────────────────────────┬──────────────────────────────────────────────────┤
 │ Worker ID: W018 (Labourer)            │ Gate Status: [ LOCKED / BARRIER CLOSED ]         │
 │ Hardhat Status: ❌ MISSING           │ Action Required: Equip hardhat to grant entry    │
 │ High-Vis Vest:  ✅ VERIFIED          │ Alert Siren:    🔊 ACTIVE                       │
 └───────────────────────────────────────┴──────────────────────────────────────────────────┘
```

#### Fig 3: Unreal Engine 5.x 3D Construction Digital Twin (`Unreal/ConstructionIntelligenceTwin/`)
```
 ┌──────────────────────────────────────────────────────────────────────────────────────────┐
 │ UNREAL ENGINE 5.3 DIGITAL TWIN (7 Site Zones, 43 3D Workers, Autonomous Patrol Drone)   │
 │ Camera Modes: [1] Overview | [2] Drone FPV | [3] CCTV Surveillance | [4] Worker Inspector  │
 │ Dynamic Heatmaps: Zone A (Green) | Zone B (Yellow) | Zone C (Glowing Red) | Zone D (Red) │
 └──────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Fig 4: FastAPI Swagger Interactive Documentation (`http://localhost:8000/docs`)
```
 ┌──────────────────────────────────────────────────────────────────────────────────────────┐
 │ FastAPI v2.0 - Agentic AI Safety Monitoring API Documentation                            │
 │ GET  /health                                 Service status check                        │
 │ GET  /api/v1/unreal/site-state               Real-time 3D state synchronization endpoint  │
 │ POST /api/v1/unreal/simulate-event           Simulate PPE violation / resolution events  │
 │ POST /predict                                Multi-factor risk ML predictor              │
 └──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 7. Challenges Faced

1. **Challenge**: Real-Time Synchronization between Unreal Engine 5.x and Python Backend without frame rate latency.
   - **Resolution**: Designed the **Dual Data Provider Pattern** (`IDataProviderInterface`), allowing Unreal Engine to run async polling requests on a background thread while maintaining 60 FPS rendering using local state caching.
2. **Challenge**: False Positives in Computer Vision PPE Detection under variable lighting and skin tone interference.
   - **Resolution**: Implemented skin-hue and background exclusion masks alongside hue-saturation-value (HSV) thresholding to ensure accurate hardhat and vest detection.
3. **Challenge**: Managing Complex State Across 26 React TypeScript Dashboard Pages.
   - **Resolution**: Utilized custom React hooks (`useAuth`, `useProject`) and modular component design to maintain consistent global state.

---

### 8. Learnings & Skills Acquired

- **Full-Stack Development**: Mastered **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **FastAPI**.
- **Database Engineering**: Gained expertise in **SQLAlchemy 2.0 ORM**, **Pydantic v2**, **Alembic**, and **PostgreSQL**.
- **Game Engine & 3D Twin Development**: Acquired hands-on experience in **Unreal Engine 5.3+ C++**, Slate/UMG UI, and HTTP REST data providers.
- **AI & Computer Vision**: Built practical knowledge of **OpenCV**, color space filtering, and agentic decision-routing algorithms.
- **Software Architecture & Git**: Developed expertise in monorepo management, Git LFS asset tracking, and RESTful API integration.

---

### 9. Testimonials from Team

> *"Working on this project during the Infosys Springboard Virtual Internship 7.0 was a transformative experience. Integrating an Unreal Engine 5 3D Digital Twin with Python FastAPI microservices and React TypeScript allowed us to bridge the gap between AI research and real-world industrial safety systems. The hands-on exposure to enterprise software architecture has significantly enhanced our engineering capabilities."*  
> **— Hema Chandra, Team Lead**

---

### 10. Conclusion

The **Agentic AI Safety Monitoring With Construction Risk Analytics** platform successfully demonstrates how modern AI, Computer Vision, and 3D Digital Twin technology can be combined into a robust industrial solution. 

The project met all objectives planned across the 8-week virtual internship. The experience gained during Infosys Springboard Virtual Internship 7.0 has provided invaluable domain knowledge in industrial AI, enterprise full-stack development, and system architecture, aligning directly with our career goals in Advanced AI Engineering and Software Architecture.

---

### 11. Acknowledgements

We express our sincere gratitude to:
- **Infosys Springboard** for providing this virtual internship platform and learning opportunity.
- Our **Mentors and Evaluators** for their guidance, feedback, and technical support throughout the 8-week duration.
- The open-source community for the tools, libraries, and frameworks that made this implementation possible.

---
*Report Compiled & Submitted for Infosys Springboard Virtual Internship 7.0*
