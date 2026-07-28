# 🏗️ Construction Intelligence Hub - Interactive GUI & ML Platform

An end-to-end Machine Learning and Interactive Web Dashboard platform for construction site telemetry, risk evaluation, cost deviation prediction, and site optimization.

---

## 🌟 Features & Modules

1. **📊 Executive Operational Overview**:
   - Real-time KPI Metric cards (Active Logged Sites, Avg Risk Score, Equipment Utilization %, Safety Incidents, Material Shortages).
   - Interactive risk score distribution histograms and operational telemetry boxplots.

2. **🔍 Exploratory Data Analysis & Analytics Studio**:
   - Multi-parameter dynamic filtering across 50,000 telemetry records.
   - Interactive Plotly visualizations: Correlation Matrix Heatmaps, Custom Bivariate Scatter Plots, and 3D Interactive Feature Terrains.

3. **🤖 Machine Learning Pipeline & Benchmark Studio**:
   - Side-by-side training and benchmarking across multiple algorithms (Linear Regression, Ridge, Lasso, Decision Trees, Random Forests, Gradient Boosting, Extra Trees).
   - Evaluation metrics leaderboard ($R^2$, $MAE$, $RMSE$, Accuracy, F1-Score).
   - Interactive Feature Importance bar charts for tree models.

4. **🎯 Real-Time Construction Risk Predictor (Single Sample Inference)**:
   - Interactive input forms for environmental factors, workforce counts, machinery status, and deviation parameters.
   - Quick site profile presets (Optimal Low Risk, Moderate Risk, High Shortage/Vibration).
   - Animated Plotly Risk Score Gauge, Risk Category badges, and actionable operational mitigation recommendations.

5. **📁 Batch CSV Predictor & Executive Risk Report**:
   - Score uploaded site telemetry CSV files in batch.
   - Automated high-risk site flags and downloadable scored dataset CSV.

6. **⚡ Interactive Construction Site Simulator**:
   - What-If Scenario Analysis to simulate how workforce reallocation, equipment utilization improvements, or material supply fixes reduce overall project risk.

---

## 🚀 How to Run the GUI Application

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Launch Streamlit Web Application
```bash
streamlit run app.py
```

Open your browser at `http://localhost:8501`.

---

## 📁 Repository Structure

```
construction-intelligence-hub/
├── app.py                      # Main Streamlit Dashboard Entrypoint
├── app_modules/
│   ├── overview.py             # Executive KPIs & Summary Dashboard
│   ├── eda.py                  # Exploratory Data Analysis & Plotly Visuals
│   ├── ml_pipeline.py          # ML Training Engine & Leaderboard
│   ├── predictor.py            # Real-Time Single Sample Risk Predictor
│   ├── batch_predict.py        # Batch CSV Inference & Export
│   └── simulator.py            # What-If Construction Site Simulator
├── utils.py                    # Data loaders, prediction pipeline & model routines
├── Construction_Intelligence_Hub.ipynb # Original Google Colab Notebook
├── construction_project_dataset.csv     # Telemetry Dataset (50,000 rows)
├── best_model.pkl              # Pre-trained ML Model Bundle
├── requirements.txt            # Python Dependencies
└── README.md                   # Project Documentation
```
