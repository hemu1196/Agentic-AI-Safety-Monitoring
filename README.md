# 🏗️ Construction Intelligence Hub - Machine Learning & 3D Digital Twin Platform

An end-to-end Machine Learning, Industrial Telemetry Analytics, 3D WebGL Digital Twin, and Risk Intelligence Platform for construction site safety, hazard detection, regulatory compliance, and insurance risk underwriting.

---

## 🌟 Key Features & 10 Dashboard Modules

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

### 📜 4. Compliance & Insurance Intelligence (`insurance_compliance.py`) — [Milestone 3]
- **OSHA / ISO 45001 Regulatory Compliance Index**: Scores overall site compliance (0–100%).
- **Insurance Underwriting Risk Rating**: Assigns financial risk grades ($A^+$, $A$, $B$, $C$, $D$, $F$) and premium rate adjustment factors (e.g., *0.85x Preferred Discount* vs. *1.60x Surcharge*).
- **Claims Severity Exposure Index**: Predicts potential financial impact of insurance claims.
- **Downloadable Audit Report**: One-click downloadable Executive Compliance Audit text report.

### 🔍 5. Exploratory Data Analysis & Analytics Studio (`eda.py`)
- Multi-parameter dynamic filtering across 50,000 telemetry records.
- Interactive Plotly visualizations: Correlation Heatmaps, Custom Bivariate Scatter Plots, and 3D Feature Topography.

### 🤖 6. Machine Learning Pipeline & Benchmark (`ml_pipeline.py`)
- Side-by-side training and benchmarking across 7 ML algorithms (*Linear Regression, Ridge, Lasso, Decision Trees, Random Forests, Gradient Boosting, Extra Trees*).
- Metrics leaderboard ($R^2$, $MAE$, $RMSE$, Accuracy, F1-Score) and feature importance bar charts.

### 🎯 7. Real-Time Construction Risk Predictor (`predictor.py`)
- Preset profiles (*Optimal Low Risk, Moderate Risk, High Shortage/Vibration*) and custom telemetry input panels.
- Animated Plotly Risk Score Gauge, Risk Category badges, and actionable mitigation guidelines.

### 🌐 8. 3D WebGL Digital Twin Viewer (`digital_twin_3d.py`)
- Real-time 3D WebGL interactive visualization of Tower Cranes, Building Slabs, Worker points, and a dynamic 3D Glowing Risk Aura Sphere.

### 📁 9. Batch CSV Predictor & Executive Report (`batch_predict.py`)
- Batch score uploaded telemetry CSV files with a live progress bar.
- High-risk alert counts and downloadable scored dataset CSV (`construction_risk_scored_batch.csv`).

### ⚡ 10. What-If Construction Site Simulator (`simulator.py`)
- Scenario simulator to test how adjusting workforce size, equipment utilization, or material supply reduces overall site risk.

---

## 🎮 Unity 3D & API Backend Integration

- **`api_server.py`**: Zero-dependency Python REST API server listening on `http://localhost:8000/predict`.
- **`unity_assets/UnityTelemetryClient.cs`**: C# Unity script that queries `api_server.py` every 2 seconds to trigger 3D warning lights, sirens, and HUD text inside Unity 3D.

---

## 🚀 How to Run the Application

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Launch Streamlit Web Dashboard
```bash
streamlit run app.py
```
> Open browser at `http://localhost:8501`.

### 3. Launch Python API Server for Unity 3D (Optional)
```bash
python3 api_server.py
```
> Listens for Unity 3D HTTP POST requests at `http://localhost:8000/predict`.

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

---

## 🏗️ Real-World Industrial Impact & Value

1. **💸 Financial Cost Overrun Prevention**: Early prediction of cost ($) and time (hours) deviations.
2. **👷 Worker Injury & Heat-Stroke Prevention**: Tracks WBGT heat strain and shift fatigue to enforce rest intervals.
3. **🚜 Predictive Machinery Maintenance**: Flags equipment vibration fatigue (>50.0) before mechanical breakdown.
4. **💳 15% Insurance Premium Savings**: Proves OSHA/ISO 45001 compliance for an $A^+$ Underwriting Rating.
