import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from utils import predict_single_sample, get_risk_level_info, render_glass_card, apply_plotly_theme

def render_simulator_page(df, bundle):
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">⚡ Interactive Construction Site Simulator</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">What-If Scenario Simulator to test operational adjustments on overall site risk.</p>
    </div>
    """, unsafe_allow_html=True)
    
    if bundle is None:
        st.error("Model bundle unavailable.")
        return

    base_sample = {
        "timestamp": "2026-07-28 12:00:00",
        "temperature": 28.0,
        "humidity": 60.0,
        "vibration_level": 30.0,
        "material_usage": 180.0,
        "machinery_status": 1,
        "worker_count": 10,
        "energy_consumption": 400.0,
        "task_progress": 0.40,
        "cost_deviation": 2000.0,
        "time_deviation": 4.0,
        "safety_incidents": 1,
        "equipment_utilization_rate": 75.0,
        "material_shortage_alert": 0,
        "simulation_deviation": 0.5,
        "update_frequency": 10,
        "optimization_suggestion": "Reallocate Workers",
        "performance_score": "Excellent"
    }

    base_score, _ = predict_single_sample(base_sample, bundle)
    base_score_clean = max(0.0, min(100.0, float(base_score))) if base_score is not None else 50.0

    col_sim_controls, col_sim_outputs = st.columns([1, 1])

    with col_sim_controls:
        st.markdown("#### 🔧 Modify Operational Levers")
        
        sim_workers = st.slider("Simulated Worker Count", 1, 50, int(base_sample["worker_count"]))
        sim_machinery = st.selectbox("Simulated Machinery Status", [1, 0], index=0 if base_sample["machinery_status"]==1 else 1, format_func=lambda x: "Active (1)" if x == 1 else "Offline (0)")
        sim_utilization = st.slider("Simulated Equipment Utilization (%)", 0.0, 100.0, float(base_sample["equipment_utilization_rate"]))
        sim_shortage = st.selectbox("Simulated Material Shortage Alert", [0, 1], index=0 if base_sample["material_shortage_alert"]==0 else 1, format_func=lambda x: "No Shortage (0)" if x == 0 else "Shortage Alert (1)")
        sim_vibration = st.slider("Simulated Vibration Level", 0.0, 100.0, float(base_sample["vibration_level"]))
        sim_safety = st.slider("Simulated Safety Incidents", 0, 10, int(base_sample["safety_incidents"]))

        sim_sample = base_sample.copy()
        sim_sample.update({
            "worker_count": sim_workers,
            "machinery_status": sim_machinery,
            "equipment_utilization_rate": sim_utilization,
            "material_shortage_alert": sim_shortage,
            "vibration_level": sim_vibration,
            "safety_incidents": sim_safety
        })

        sim_score, _ = predict_single_sample(sim_sample, bundle)
        sim_score_clean = max(0.0, min(100.0, float(sim_score))) if sim_score is not None else 50.0

    with col_sim_outputs:
        st.markdown("#### 📊 Scenario Results Comparison")
        
        delta_score = sim_score_clean - base_score_clean
        
        c_base, c_sim = st.columns(2)
        with c_base:
            st.markdown(render_glass_card("Baseline Risk", f"{base_score_clean:.1f}", "Current site state", "📌"), unsafe_allow_html=True)
        with c_sim:
            delta_color = "linear-gradient(135deg, #10b981 0%, #34d399 100%)" if delta_score <= 0 else "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
            st.markdown(render_glass_card("Simulated Risk", f"{sim_score_clean:.1f}", f"Delta: {delta_score:+.1f} pts", "⚡", delta_color), unsafe_allow_html=True)

        fig_sim_cmp = go.Figure()
        fig_sim_cmp.add_trace(go.Bar(
            x=["Baseline Scenario", "Simulated Scenario"],
            y=[base_score_clean, sim_score_clean],
            marker_color=["#38bdf8", "#10b981" if delta_score <= 0 else "#ef4444"],
            text=[f"{base_score_clean:.1f}", f"{sim_score_clean:.1f}"],
            textposition="auto"
        ))
        apply_plotly_theme(fig_sim_cmp, height=300, title="Baseline vs. Simulated Risk Score")
        fig_sim_cmp.update_layout(yaxis=dict(range=[0, 100]))
        st.plotly_chart(fig_sim_cmp, use_container_width=True)

        base_info = get_risk_level_info(base_score_clean)
        sim_info = get_risk_level_info(sim_score_clean)

        st.markdown(f"**Baseline Status**: <span style='color:{base_info['color']}; font-weight:bold;'>{base_info['level']}</span>", unsafe_allow_html=True)
        st.markdown(f"**Simulated Status**: <span style='color:{sim_info['color']}; font-weight:bold;'>{sim_info['level']}</span>", unsafe_allow_html=True)

        if delta_score < -2.0:
            st.success("🎉 Operational adjustments successfully lowered the site risk score!")
        elif delta_score > 2.0:
            st.warning("⚠️ Operational adjustments increased the predicted risk score.")
        else:
            st.info("ℹ️ Minimal change in overall risk score.")
