import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from utils import compute_hazard_indices, render_glass_card, apply_plotly_theme

def render_hazard_detection_page(df):
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">⚠️ Milestone 1: Site Risk Monitoring & Hazard Detection</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Automated Environmental Heat Strain (WBGT), Machine Vibration Fatigue & Sensor Anomaly Engine.</p>
    </div>
    """, unsafe_allow_html=True)
    
    if df is None:
        st.warning("Dataset unavailable.")
        return

    st.markdown("### 🎛️ Real-Time Sensor Telemetry Controls")
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        temp = st.slider("Temperature (°C)", 10.0, 50.0, 36.0, step=0.5)
    with c2:
        humidity = st.slider("Humidity (%)", 10.0, 100.0, 75.0, step=1.0)
    with c3:
        vibration = st.slider("Vibration Level", 0.0, 100.0, 55.0, step=1.0)
    with c4:
        energy = st.slider("Energy Usage (kWh)", 100.0, 1000.0, 480.0, step=10.0)

    # Compute Hazard Metrics
    h_info = compute_hazard_indices(temp, humidity, vibration, energy)

    # Glass KPI Cards
    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown(render_glass_card(
            "WBGT Heat Index", f"{h_info['wbgt_index']} °C",
            "Thermal Strain Threshold: 32°C", "🌡️",
            "linear-gradient(135deg, #ef4444 0%, #f87171 100%)" if h_info['is_thermal_hazard'] else "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
        ), unsafe_allow_html=True)
        
    with k2:
        st.markdown(render_glass_card(
            "Vibration Fatigue", f"{h_info['vibration_fatigue_pct']}%",
            "Mechanical Limit: 50.0", "⚙️",
            "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" if h_info['is_vibration_hazard'] else "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)"
        ), unsafe_allow_html=True)

    with k3:
        st.markdown(render_glass_card(
            "Energy Spike Warning", "SPIKE DETECTED" if h_info['is_energy_spike'] else "NORMAL",
            "Peak Load: 600 kWh", "⚡",
            "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)" if h_info['is_energy_spike'] else "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
        ), unsafe_allow_html=True)

    with k4:
        st.markdown(render_glass_card(
            "Overall Hazard Status", h_info['hazard_status'],
            "Environment Status Flag", "🚨" if "HAZARD" in h_info['hazard_status'] else "✅",
            "linear-gradient(135deg, #881337 0%, #f43f5e 100%)" if "CRITICAL" in h_info['hazard_status'] else "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
        ), unsafe_allow_html=True)

    st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)
    st.markdown("### 📊 Dataset Hazard Anomaly Distribution")

    g1, g2 = st.columns(2)
    with g1:
        # Scatterplot Temp vs Vibration
        fig_hazard = px.scatter(
            df.sample(min(1500, len(df))),
            x="temperature",
            y="vibration_level",
            color="risk_score",
            color_continuous_scale="Turbo",
            title="Temperature vs Vibration Hazard Map"
        )
        apply_plotly_theme(fig_hazard, height=350)
        st.plotly_chart(fig_hazard, use_container_width=True)

    with g2:
        # Energy Consumption Anomaly Boxplot
        fig_energy = px.box(
            df,
            x="machinery_status",
            y="energy_consumption",
            color="machinery_status",
            title="Energy Consumption Load by Machinery Status",
            color_discrete_map={0: "#ef4444", 1: "#38bdf8"}
        )
        apply_plotly_theme(fig_energy, height=350)
        st.plotly_chart(fig_energy, use_container_width=True)
