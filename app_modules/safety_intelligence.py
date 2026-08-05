import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from utils import compute_safety_worker_protection, render_glass_card, apply_plotly_theme

def render_safety_intelligence_page(df):
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">🦺 Milestone 2: Safety Intelligence & Worker Protection</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Worker Shift Fatigue Monitoring, Heat Exposure Guidelines, and Incident Prevention Directives.</p>
    </div>
    """, unsafe_allow_html=True)
    
    if df is None:
        st.warning("Dataset unavailable.")
        return

    st.markdown("### 👷 Shift Operational Parameters")
    sc1, sc2, sc3, sc4 = st.columns(4)
    with sc1:
        workers = st.slider("Worker Count on Site", 1, 50, 18, key="s_workers")
    with sc2:
        temp = st.slider("Ambient Temp (°C)", 15.0, 50.0, 34.0, key="s_temp")
    with sc3:
        safety_incidents = st.number_input("Safety Incidents Logged", 0, 10, 1, key="s_incidents")
    with sc4:
        time_dev = st.slider("Shift Overtime / Delay (Hours)", -5.0, 20.0, 4.0, key="s_time_dev")

    # Compute Safety Intelligence Metrics
    s_info = compute_safety_worker_protection(workers, temp, safety_incidents, time_dev)

    # Glass Metric Cards
    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown(render_glass_card(
            "Worker Shift Fatigue", f"{s_info['fatigue_pct']}%",
            "Fatigue Limit: 70%", "🦺",
            "linear-gradient(135deg, #ef4444 0%, #f87171 100%)" if s_info['fatigue_pct'] > 70 else "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
        ), unsafe_allow_html=True)

    with k2:
        st.markdown(render_glass_card(
            "Incident Probability", f"{s_info['incident_prob_pct']}%",
            "Incident Risk Score", "⚠️",
            "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
        ), unsafe_allow_html=True)

    with k3:
        st.markdown(render_glass_card(
            "Mandatory Rest Frequency", s_info['rest_freq'],
            "OSHA Thermal Work Guideline", "⏳",
            "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)"
        ), unsafe_allow_html=True)

    with k4:
        st.markdown(render_glass_card(
            "Shift Safety Status", "ELEVATED FATIGUE" if s_info['fatigue_pct'] > 60 else "HEALTHY SHIFT",
            "Worker Strain Status", "🚨" if s_info['fatigue_pct'] > 60 else "✅",
            "linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)" if s_info['fatigue_pct'] > 60 else "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
        ), unsafe_allow_html=True)

    st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)
    st.info(f"📋 **Mandatory Worker Protection Directive**: {s_info['directive']}")

    st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)
    st.markdown("### 📊 Safety Incident Breakdown & Fatigue Drivers")

    c_left, c_right = st.columns(2)
    with c_left:
        # Safety incidents by worker count bar chart
        if "safety_incidents" in df.columns and "worker_count" in df.columns:
            fig_incidents = px.histogram(
                df,
                x="safety_incidents",
                color="safety_incidents",
                title="Historical Safety Incidents Distribution Across Sites",
                color_discrete_sequence=px.colors.qualitative.Bold
            )
            apply_plotly_theme(fig_incidents, height=340)
            st.plotly_chart(fig_incidents, use_container_width=True)

    with c_right:
        # Gauge for Shift Fatigue
        fig_gauge = go.Figure(go.Indicator(
            mode="gauge+number",
            value=s_info['fatigue_pct'],
            title={'text': "Shift Worker Strain & Fatigue Gauge (%)", 'font': {'size': 16, 'color': "white"}},
            gauge={
                'axis': {'range': [0, 100], 'tickcolor': "white"},
                'bar': {'color': "#f43f5e" if s_info['fatigue_pct'] > 70 else "#10b981"},
                'steps': [
                    {'range': [0, 50], 'color': 'rgba(16, 185, 129, 0.2)'},
                    {'range': [50, 70], 'color': 'rgba(245, 158, 11, 0.2)'},
                    {'range': [70, 100], 'color': 'rgba(244, 63, 94, 0.3)'}
                ]
            }
        ))
        apply_plotly_theme(fig_gauge, height=340)
        st.plotly_chart(fig_gauge, use_container_width=True)
