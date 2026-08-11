# 🤖 Agentic AI Safety Monitoring With Construction Risk Analytics

An end-to-end Agentic AI, Computer Vision PPE Inspection, Industrial Telemetry Analytics, 3D WebGL Digital Twin, and Risk Intelligence Platform for construction site safety, hazard detection, regulatory compliance, and insurance risk underwriting.

---

## 💻 Quick Guide: How Anyone Can View & Run the GUI

If someone is visiting your GitHub repository and wants to view or run the interactive Web GUI, here are the simple steps:

### Option A: Run the GUI Locally (3 Steps)
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/hemu1196/construction-intelligence-hub.git
   cd construction-intelligence-hub
   ```
2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Launch Streamlit Dashboard**:
   ```bash
   streamlit run app.py
   ```
   > 🌐 Open your browser at `http://localhost:8501`.

---

### Option B: Deploy Free 1-Click Live Web Link (Streamlit Cloud)
To give anyone a **live web link** (e.g. `https://construction-intelligence-hub.streamlit.app`) so they can view the GUI without installing anything:
1. Go to [share.streamlit.io](https://share.streamlit.io) and log in with GitHub.
2. Click **New App** $\rightarrow$ select repository `hemu1196/construction-intelligence-hub`, branch `main`, main file `app.py`.
3. Click **Deploy!**

---

## 🌟 Key Features & 11 Dashboard Modules

### 📊 1. Executive Operational Overview (`overview.py`)
- Real-time KPI Metric cards (*Active Logs, Avg Risk Score, Equipment Utilization %, Safety Incidents, Material Shortages*).
- Interactive risk score distribution histograms and operational telemetry boxplots.

### ⚠️ 2. Site Risk Monitoring & Hazard Detection (`hazard_detection.py`) — [Milestone 1]
- **WBGT Thermal Stress Index Calculator**: Real-time heat strain index combining ambient temperature and humidity.
- **Vibration Fatigue Warning Engine**: Tracks heavy equipment vibration levels exceeding mechanical thresholds (>50.0).
- **Power Load Spike Alerts**: Detects electrical energy surges (>600 kWh).

### 🦺 3. Safety Intelligence & Worker Protection (`safety_intelligence.py`) — [Milestone 2]
- **Worker Shift Fatigue Meter**: Calculates physical strain % based on workforce density, weather, and shift overtime.
- **Safety Incident Probability Engine**: Predicts likelihood % of site injuries occurring.
- **Actionable Safety Directives**: OSHA-standard hydration checkpoints, shaded rest intervals, and PPE protocols.

### 🚁 4. Drone AI & Computer Vision PPE Safety (`drone_cv_safety.py`)
- **OpenCV AI Helmet Detection**: Real-time bounding box detection tagging compliant workers (Green: Hardhat OK) vs non-compliant workers (Red: No Helmet!).
- **Drone Telemetry HUD Overlay**: Altitude, battery level, GPS coordinates, and real-time PPE compliance rating %.

### 📜 5. Compliance & Insurance Intelligence (`insurance_compliance.py`) — [Milestone 3]
- **OSHA / ISO 45001 Regulatory Compliance Index**: Scores overall site compliance (0–100%).
- **Insurance Underwriting Risk Rating**: Assigns financial risk grades ($A^+$, $A$, $B$, $C$, $D$, $F$) and premium rate adjustment factors (e.g., *0.85x Preferred Discount* vs. *1.60x Surcharge*).
- **Claims Severity Exposure Index**: Predicts potential financial impact of insurance claims.
- **Downloadable Audit Report**: One-click downloadable Executive Compliance Audit text report.

### 🔍 6. Exploratory Data Analysis & Analytics Studio (`eda.py`)
- Multi-parameter dynamic filtering across 50,000 telemetry records.
- Interactive Plotly visualizations: Correlation Heatmaps, Custom Bivariate Scatter Plots, and 3D Feature Topography.

### 🤖 7. Machine Learning Pipeline & Benchmark (`ml_pipeline.py`)
- Side-by-side training and benchmarking across 7 ML algorithms (*Linear Regression, Ridge, Lasso, Decision Trees, Random Forests, Gradient Boosting, Extra Trees*).
- Metrics leaderboard ($R^2$, $MAE$, $RMSE$, Accuracy, F1-Score) and feature importance bar charts.

### 🎯 8. Real-Time Construction Risk Predictor (`predictor.py`)
- Preset profiles (*Optimal Low Risk, Moderate Risk, High Shortage/Vibration*) and custom telemetry input panels.
- Animated Plotly Risk Score Gauge, Risk Category badges, and actionable mitigation guidelines.

### 🌐 9. 3D WebGL Digital Twin Viewer (`digital_twin_3d.py`)
- Real-time 3D WebGL interactive visualization of Tower Cranes, Building Slabs, Worker points, and a dynamic 3D Glowing Risk Aura Sphere.

### 📁 10. Batch CSV Predictor & Executive Report (`batch_predict.py`)
- Batch score uploaded telemetry CSV files with a live progress bar.
- High-risk alert counts and downloadable scored dataset CSV (`construction_risk_scored_batch.csv`).

### ⚡ 11. What-If Construction Site Simulator (`simulator.py`)
- Scenario simulator to test how adjusting workforce size, equipment utilization, or material supply reduces overall site risk.

---

## 🎮 Unity 3D & API Backend Integration

- **`api_server.py`**: Zero-dependency Python REST API server listening on `http://localhost:8000/predict`.
- **`unity_assets/UnityTelemetryClient.cs`**: C# Unity script that queries `api_server.py` every 2 seconds to trigger 3D warning lights, sirens, and HUD text inside Unity 3D.

---

## 📁 Repository Structure

```
construction-intelligence-hub/
├── app.py                      # Main Streamlit Dashboard Entrypoint & Design System
├── utils.py                    # Data loaders, ML pipeline & calculation engines
├── api_server.py               # REST API Server for Unity 3D Integration
├── unity_assets/
│   └── UnityTelemetryClient.cs  # C# Unity Telemetry Client Script
├── app_modules/
│   ├── overview.py             # 📊 Executive KPIs & Summary Dashboard
│   ├── hazard_detection.py     # ⚠️ Milestone 1: Site Risk & Hazard Detection
│   ├── safety_intelligence.py  # 🦺 Milestone 2: Safety & Worker Protection
│   ├── drone_cv_safety.py      # 🚁 Drone AI & Computer Vision PPE Safety
│   ├── insurance_compliance.py # 📜 Milestone 3: Compliance & Insurance Intelligence
│   ├── eda.py                  # 🔍 Exploratory Data Analysis & Plotly Visuals
│   ├── ml_pipeline.py          # 🤖 ML Training Engine & Leaderboard
│   ├── predictor.py            # 🎯 Real-Time Single Sample Risk Predictor
│   ├── digital_twin_3d.py      # 🌐 3D Interactive WebGL Digital Twin
│   ├── batch_predict.py        # 📁 Batch CSV Inference & Export
│   └── simulator.py            # ⚡ What-If Construction Site Simulator
├── construction_project_dataset.csv     # Telemetry Dataset (50,000 rows)
├── best_model.pkl              # Pre-trained ML Model Bundle
├── requirements.txt            # Python Dependencies
└── README.md                   # Project Documentation
```
