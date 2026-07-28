import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from utils import predict_single_sample, get_risk_level_info, apply_plotly_theme

def render_predictor_page(df, bundle):
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">🎯 Real-Time Construction Risk Predictor</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Input site telemetry metrics for instant AI risk scoring and mitigation instructions.</p>
    </div>
    """, unsafe_allow_html=True)
    
    if bundle is None:
        st.error("⚠️ Model bundle (`best_model.pkl`) missing.")
        return

    # Default preset dictionaries
    presets_dict = {
        "Custom Input": {
            "temperature": 25.0, "humidity": 65.0, "vibration_level": 25.0, "material_usage": 150.0,
            "machinery_status": 1, "worker_count": 12, "energy_consumption": 380.0, "task_progress": 0.50,
            "cost_deviation": 500.0, "time_deviation": 0.0, "safety_incidents": 0, "equipment_utilization_rate": 85.0,
            "material_shortage_alert": 0, "simulation_deviation": 0.5, "update_frequency": 10,
            "optimization_suggestion": "Optimize Material Usage"
        },
        "Optimal Low Risk Site": {
            "temperature": 22.0, "humidity": 50.0, "vibration_level": 15.0, "material_usage": 120.0,
            "machinery_status": 1, "worker_count": 16, "energy_consumption": 320.0, "task_progress": 0.70,
            "cost_deviation": -200.0, "time_deviation": -2.0, "safety_incidents": 0, "equipment_utilization_rate": 92.0,
            "material_shortage_alert": 0, "simulation_deviation": 0.2, "update_frequency": 10,
            "optimization_suggestion": "Optimize Material Usage"
        },
        "Moderate Risk Site": {
            "temperature": 32.0, "humidity": 75.0, "vibration_level": 35.0, "material_usage": 190.0,
            "machinery_status": 1, "worker_count": 8, "energy_consumption": 450.0, "task_progress": 0.40,
            "cost_deviation": 2500.0, "time_deviation": 5.0, "safety_incidents": 1, "equipment_utilization_rate": 70.0,
            "material_shortage_alert": 0, "simulation_deviation": 0.8, "update_frequency": 10,
            "optimization_suggestion": "Reallocate Workers"
        },
        "High Shortage & Vibration Site": {
            "temperature": 38.0, "humidity": 85.0, "vibration_level": 65.0, "material_usage": 260.0,
            "machinery_status": 0, "worker_count": 4, "energy_consumption": 680.0, "task_progress": 0.20,
            "cost_deviation": 8500.0, "time_deviation": 15.0, "safety_incidents": 3, "equipment_utilization_rate": 45.0,
            "material_shortage_alert": 1, "simulation_deviation": 2.5, "update_frequency": 10,
            "optimization_suggestion": "Adjust Schedule"
        }
    }

    st.markdown("#### ⚡ Quick Preset Profiles")
    selected_preset = st.radio(
        "Load Profile Preset:",
        list(presets_dict.keys()),
        horizontal=True
    )

    p_data = presets_dict[selected_preset]

    st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)
    
    with st.form("risk_predictor_form"):
        st.markdown("<h3 style='font-family: Outfit, sans-serif; color: #38bdf8;'>📋 Site Telemetry Input Panel</h3>", unsafe_allow_html=True)
        
        c1, c2, c3 = st.columns(3)
        
        with c1:
            st.markdown("##### 🌡️ Environmental & Sensors")
            temp = st.number_input("Temperature (°C)", min_value=0.0, max_value=60.0, value=float(p_data["temperature"]), step=0.5)
            humidity = st.number_input("Humidity (%)", min_value=0.0, max_value=100.0, value=float(p_data["humidity"]), step=1.0)
            vibration = st.number_input("Vibration Level", min_value=0.0, max_value=100.0, value=float(p_data["vibration_level"]), step=1.0)
            energy = st.number_input("Energy Usage (kWh)", min_value=0.0, max_value=2000.0, value=float(p_data["energy_consumption"]), step=10.0)

        with c2:
            st.markdown("##### 👷 Workforce & Equipment")
            workers = st.number_input("Worker Count", min_value=1, max_value=100, value=int(p_data["worker_count"]), step=1)
            machinery = st.selectbox("Machinery Status", options=[1, 0], index=0 if p_data["machinery_status"] == 1 else 1, format_func=lambda x: "Active (1)" if x == 1 else "Idle / Offline (0)")
            utilization = st.slider("Equipment Utilization (%)", 0.0, 100.0, float(p_data["equipment_utilization_rate"]), step=1.0)
            safety = st.number_input("Safety Incidents Logged", min_value=0, max_value=20, value=int(p_data["safety_incidents"]), step=1)

        with c3:
            st.markdown("##### 📦 Supply & Schedule Deviations")
            material_use = st.number_input("Material Usage", min_value=0.0, max_value=1000.0, value=float(p_data["material_usage"]), step=5.0)
            shortage = st.selectbox("Material Shortage Alert", options=[0, 1], index=0 if p_data["material_shortage_alert"] == 0 else 1, format_func=lambda x: "Normal (0)" if x == 0 else "Shortage Alert! (1)")
            cost_dev = st.number_input("Cost Deviation ($)", value=float(p_data["cost_deviation"]), step=100.0)
            time_dev = st.number_input("Time Deviation (Hours)", value=float(p_data["time_deviation"]), step=1.0)

        st.markdown("##### ⚙️ System Parameters")
        sc1, sc2, sc3 = st.columns(3)
        with sc1:
            progress = st.slider("Task Progress", 0.0, 1.0, float(p_data["task_progress"]), step=0.05)
        with sc2:
            sim_dev = st.number_input("Simulation Deviation", min_value=0.0, max_value=10.0, value=float(p_data["simulation_deviation"]), step=0.1)
        with sc3:
            opts = ["Optimize Material Usage", "Reallocate Workers", "Increase Machinery", "Adjust Schedule"]
            idx_opt = opts.index(p_data["optimization_suggestion"]) if p_data["optimization_suggestion"] in opts else 0
            opt_sug = st.selectbox("Optimization Strategy", options=opts, index=idx_opt)

        submit_btn = st.form_submit_button("🔮 Calculate Risk Score", type="primary", use_container_width=True)

    # Compute prediction automatically or when submitted
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
        display_score = max(0.0, min(100.0, float(risk_score)))
        info = get_risk_level_info(display_score)

        st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)
        st.markdown("### 🎯 AI Risk Evaluation Output")

        out_col1, out_col2 = st.columns([1, 1])

        with out_col1:
            fig_gauge = go.Figure(go.Indicator(
                mode="gauge+number",
                value=round(display_score, 1),
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': "Predicted Construction Risk Score", 'font': {'size': 18, 'color': "white", 'family': "Outfit"}},
                gauge={
                    'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': "white"},
                    'bar': {'color': info['color']},
                    'bgcolor': "rgba(15, 23, 42, 0.6)",
                    'bordercolor': "rgba(255, 255, 255, 0.15)",
                    'steps': [
                        {'range': [0, 25], 'color': 'rgba(16, 185, 129, 0.25)'},
                        {'range': [25, 50], 'color': 'rgba(245, 158, 11, 0.25)'},
                        {'range': [50, 75], 'color': 'rgba(239, 68, 68, 0.25)'},
                        {'range': [75, 100], 'color': 'rgba(244, 63, 94, 0.35)'}
                    ],
                }
            ))
            apply_plotly_theme(fig_gauge, height=320)
            st.plotly_chart(fig_gauge, use_container_width=True, config={'displayModeBar': False})

        with out_col2:
            st.markdown(f"""
            <div style="
                background: {info['bg_color']};
                border: 1px solid {info['border_color']};
                border-radius: 16px;
                padding: 24px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 0.8rem; font-weight: 700; color: {info['color']}; text-transform: uppercase; letter-spacing: 0.06em;">RISK EVALUATION BADGE</div>
                <div style="font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 800; color: {info['color']}; margin: 4px 0 10px 0;">
                    {info['level']}
                </div>
                <div style="color: #f8fafc; font-size: 0.95rem; line-height: 1.5; margin-bottom: 16px;">
                    {info['description']}
                </div>
                <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.12); padding: 12px 16px; border-radius: 10px; color: #38bdf8; font-weight: 600; font-size: 0.9rem;">
                    💡 <strong>Actionable Directive:</strong> {info['action']}
                </div>
            </div>
            """, unsafe_allow_html=True)
