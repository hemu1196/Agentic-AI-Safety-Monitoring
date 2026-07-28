import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from utils import predict_single_sample, get_risk_level_info

def render_predictor_page(df, bundle):
    st.markdown("## 🎯 Real-Time Construction Risk Predictor")
    st.markdown("Enter site telemetry and operational metrics to receive instant risk score predictions and mitigation guidelines.")
    
    if bundle is None:
        st.error("⚠️ Model bundle (`best_model.pkl`) could not be loaded. Please ensure the file is in the root directory.")
        return

    # Sample presets
    st.markdown("#### ⚡ Quick Preset Configuration")
    preset = st.radio(
        "Load Preset Profile:",
        ["Custom Input", "Optimal Low Risk Site", "Moderate Risk Site", "High Shortage & Vibration Site"],
        horizontal=True
    )

    defaults = {
        "temperature": 25.0,
        "humidity": 65.0,
        "vibration_level": 25.0,
        "material_usage": 150.0,
        "machinery_status": 1,
        "worker_count": 12,
        "energy_consumption": 380.0,
        "task_progress": 0.50,
        "cost_deviation": 500.0,
        "time_deviation": 0.0,
        "safety_incidents": 0,
        "equipment_utilization_rate": 85.0,
        "material_shortage_alert": 0,
        "simulation_deviation": 0.5,
        "update_frequency": 10,
        "optimization_suggestion": "Optimize Material Usage",
        "performance_score": "Excellent"
    }

    if preset == "Optimal Low Risk Site":
        defaults.update({
            "temperature": 22.0,
            "humidity": 50.0,
            "vibration_level": 15.0,
            "machinery_status": 1,
            "worker_count": 15,
            "safety_incidents": 0,
            "material_shortage_alert": 0,
            "equipment_utilization_rate": 92.0,
            "cost_deviation": -200.0,
            "time_deviation": -2.0
        })
    elif preset == "Moderate Risk Site":
        defaults.update({
            "temperature": 32.0,
            "humidity": 75.0,
            "vibration_level": 35.0,
            "machinery_status": 1,
            "worker_count": 8,
            "safety_incidents": 1,
            "material_shortage_alert": 0,
            "equipment_utilization_rate": 70.0,
            "cost_deviation": 2500.0,
            "time_deviation": 5.0
        })
    elif preset == "High Shortage & Vibration Site":
        defaults.update({
            "temperature": 38.0,
            "humidity": 85.0,
            "vibration_level": 60.0,
            "machinery_status": 0,
            "worker_count": 4,
            "safety_incidents": 3,
            "material_shortage_alert": 1,
            "equipment_utilization_rate": 45.0,
            "cost_deviation": 8500.0,
            "time_deviation": 15.0
        })

    st.markdown("---")
    
    with st.form("risk_predictor_form"):
        st.markdown("### 📋 Site Parameter Controls")
        
        c1, c2, c3 = st.columns(3)
        
        with c1:
            st.markdown("##### 🌡️ Environmental & Sensor Parameters")
            temp = st.number_input("Temperature (°C)", min_value=0.0, max_value=60.0, value=float(defaults["temperature"]), step=0.5)
            humidity = st.number_input("Humidity (%)", min_value=0.0, max_value=100.0, value=float(defaults["humidity"]), step=1.0)
            vibration = st.number_input("Vibration Level", min_value=0.0, max_value=100.0, value=float(defaults["vibration_level"]), step=1.0)
            energy = st.number_input("Energy Consumption (kWh)", min_value=0.0, max_value=2000.0, value=float(defaults["energy_consumption"]), step=10.0)

        with c2:
            st.markdown("##### 👷 Workforce & Equipment")
            workers = st.number_input("Worker Count", min_value=1, max_value=100, value=int(defaults["worker_count"]), step=1)
            machinery = st.selectbox("Machinery Status", options=[1, 0], index=0 if defaults["machinery_status"] == 1 else 1, format_func=lambda x: "Active / Operational (1)" if x == 1 else "Idle / Offline (0)")
            utilization = st.slider("Equipment Utilization Rate (%)", 0.0, 100.0, float(defaults["equipment_utilization_rate"]), step=1.0)
            safety = st.number_input("Safety Incidents Logged", min_value=0, max_value=20, value=int(defaults["safety_incidents"]), step=1)

        with c3:
            st.markdown("##### 📦 Material & Schedule Deviations")
            material_use = st.number_input("Material Usage Rate", min_value=0.0, max_value=1000.0, value=float(defaults["material_usage"]), step=5.0)
            shortage = st.selectbox("Material Shortage Alert", options=[0, 1], index=0 if defaults["material_shortage_alert"] == 0 else 1, format_func=lambda x: "No Shortage (0)" if x == 0 else "Material Shortage Alert! (1)")
            cost_dev = st.number_input("Cost Deviation ($)", value=float(defaults["cost_deviation"]), step=100.0)
            time_dev = st.number_input("Time Deviation (Hours)", value=float(defaults["time_deviation"]), step=1.0)

        st.markdown("##### ⚙️ Advanced System Metadata")
        sc1, sc2, sc3 = st.columns(3)
        with sc1:
            progress = st.slider("Task Progress", 0.0, 1.0, float(defaults["task_progress"]), step=0.05)
        with sc2:
            sim_dev = st.number_input("Simulation Deviation", min_value=0.0, max_value=10.0, value=float(defaults["simulation_deviation"]), step=0.1)
        with sc3:
            opt_sug = st.selectbox("Optimization Strategy", options=["Optimize Material Usage", "Reallocate Workers", "Increase Machinery", "Adjust Schedule"], index=0)

        submit_btn = st.form_submit_button("🔮 Predict Construction Risk Score", type="primary", use_container_width=True)

    if submit_btn or preset != "Custom Input":
        sample_data = {
            "timestamp": "2026-07-28 12:00:00",
            "temperature": temp,
            "humidity": humidity,
            "vibration_level": vibration,
            "material_usage": material_use,
            "machinery_status": machinery,
            "worker_count": workers,
            "energy_consumption": energy,
            "task_progress": progress,
            "cost_deviation": cost_dev,
            "time_deviation": time_dev,
            "safety_incidents": safety,
            "equipment_utilization_rate": utilization,
            "material_shortage_alert": shortage,
            "simulation_deviation": sim_dev,
            "update_frequency": 10,
            "optimization_suggestion": opt_sug,
            "performance_score": "Excellent"
        }

        risk_score, err = predict_single_sample(sample_data, bundle)

        if err:
            st.error(f"Prediction Error: {err}")
        else:
            # Bound risk score cleanly between 0 and 100 for display gauge
            display_score = max(0.0, min(100.0, float(risk_score)))
            info = get_risk_level_info(display_score)

            st.markdown("---")
            st.subheader("🎯 Prediction Output & Risk Assessment")

            out_col1, out_col2 = st.columns([1, 1])

            with out_col1:
                # Gauge Chart
                fig_gauge = go.Figure(go.Indicator(
                    mode="gauge+number",
                    value=round(display_score, 1),
                    domain={'x': [0, 1], 'y': [0, 1]},
                    title={'text': "Predicted Construction Risk Score", 'font': {'size': 20, 'color': "white"}},
                    gauge={
                        'axis': {'range': [None, 100], 'tickwidth': 1, 'tickcolor': "white"},
                        'bar': {'color': info['color']},
                        'bgcolor': "#1e293b",
                        'bordercolor': "#475569",
                        'steps': [
                            {'range': [0, 25], 'color': 'rgba(16, 185, 129, 0.25)'},
                            {'range': [25, 50], 'color': 'rgba(245, 158, 11, 0.25)'},
                            {'range': [50, 75], 'color': 'rgba(239, 68, 68, 0.25)'},
                            {'range': [75, 100], 'color': 'rgba(136, 19, 55, 0.4)'}
                        ],
                    }
                ))
                fig_gauge.update_layout(template="plotly_dark", height=320, margin=dict(l=30, r=30, t=50, b=20))
                st.plotly_chart(fig_gauge, use_container_width=True)

            with out_col2:
                st.markdown(f"### Assessment: <span style='color:{info['color']}; font-weight:bold;'>{info['level']}</span>", unsafe_allow_html=True)
                st.markdown(f"**Description**: {info['description']}")
                
                st.info(f"💡 **Recommended Action**: {info['action']}")
                
                # Dynamic Breakdown Cards
                st.markdown("##### 📌 Key Influencing Indicators:")
                bullets = []
                if shortage == 1:
                    bullets.append("⚠️ **Material Shortage Alert Active**: Immediate supplier re-orders required.")
                if safety > 0:
                    bullets.append(f"🚨 **{safety} Safety Incident(s)** logged on site.")
                if utilization < 60:
                    bullets.append(f"📉 **Low Equipment Utilization ({utilization}%)**: Machinery underperforming.")
                if cost_dev > 2000:
                    bullets.append(f"💸 **High Cost Overrun (${cost_dev:,.2f})**.")
                if not bullets:
                    bullets.append("✅ Telemetry metrics are within healthy limits.")
                    
                for b in bullets:
                    st.markdown(f"- {b}")
