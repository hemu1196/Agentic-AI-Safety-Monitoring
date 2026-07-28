import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from utils import render_glass_card, apply_plotly_theme

def render_overview_page(df):
    st.markdown("""
    <div style="margin-bottom: 24px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">📊 Executive Operational Control Center</h2>
        <p style="color: #94a3b8; margin-top: 4px; font-size: 0.95rem;">Real-time site telemetry, equipment efficiency metrics, and risk distributions.</p>
    </div>
    """, unsafe_allow_html=True)
    
    if df is None:
        st.warning("Dataset unavailable.")
        return
        
    total_records = len(df)
    avg_risk = df['risk_score'].mean() if 'risk_score' in df.columns else 0
    avg_equip_util = df['equipment_utilization_rate'].mean() if 'equipment_utilization_rate' in df.columns else 0
    total_safety = df['safety_incidents'].sum() if 'safety_incidents' in df.columns else 0
    shortage_alerts = df['material_shortage_alert'].sum() if 'material_shortage_alert' in df.columns else 0

    # Glassmorphic KPI Cards
    c1, c2, c3, c4, c5 = st.columns(5)
    
    with c1:
        st.markdown(render_glass_card(
            title="Total Telemetry Logs",
            value=f"{total_records:,}",
            subtext="50,000 active site records",
            icon="📡",
            gradient="linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
            border_color="rgba(56, 189, 248, 0.4)"
        ), unsafe_allow_html=True)
        
    with c2:
        st.markdown(render_glass_card(
            title="Avg Site Risk Score",
            value=f"{avg_risk:.1f}",
            subtext="Scale: 0 (Safe) - 100 (Critical)",
            icon="🛡️",
            gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
            border_color="rgba(245, 158, 11, 0.4)"
        ), unsafe_allow_html=True)

    with c3:
        st.markdown(render_glass_card(
            title="Equipment Utilization",
            value=f"{avg_equip_util:.1f}%",
            subtext="Machinery uptime ratio",
            icon="🚜",
            gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)",
            border_color="rgba(16, 185, 129, 0.4)"
        ), unsafe_allow_html=True)

    with c4:
        st.markdown(render_glass_card(
            title="Material Shortages",
            value=f"{shortage_alerts:,}",
            subtext="Active shortage alerts",
            icon="📦",
            gradient="linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
            border_color="rgba(239, 68, 68, 0.4)"
        ), unsafe_allow_html=True)

    with c5:
        st.markdown(render_glass_card(
            title="Safety Incidents",
            value=f"{int(total_safety):,}",
            subtext="Logged on-site events",
            icon="⚠️",
            gradient="linear-gradient(135deg, #c084fc 0%, #e879f9 100%)",
            border_color="rgba(192, 132, 252, 0.4)"
        ), unsafe_allow_html=True)

    st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)

    col_left, col_right = st.columns([6, 4])
    
    with col_left:
        fig_hist = px.histogram(
            df,
            x="risk_score",
            nbins=40,
            color_discrete_sequence=["#38bdf8"],
            title="📈 Construction Risk Score Distribution",
            labels={"risk_score": "Risk Score (0 - 100)"}
        )
        apply_plotly_theme(fig_hist, height=340)
        st.plotly_chart(fig_hist, use_container_width=True)

    with col_right:
        if "optimization_suggestion" in df.columns:
            opt_counts = df["optimization_suggestion"].value_counts().reset_index()
            opt_counts.columns = ["Suggestion", "Count"]
            fig_pie = px.pie(
                opt_counts,
                names="Suggestion",
                values="Count",
                color_discrete_sequence=["#38bdf8", "#818cf8", "#fbbf24", "#f43f5e"],
                title="💡 Optimization Strategy Distribution",
                hole=0.45
            )
            apply_plotly_theme(fig_pie, height=340)
            fig_pie.update_traces(textposition='inside', textinfo='percent+label')
            st.plotly_chart(fig_pie, use_container_width=True)

    st.markdown("### 📊 Operational Telemetry Analytics")
    t1, t2 = st.columns(2)
    
    with t1:
        if "equipment_utilization_rate" in df.columns and "machinery_status" in df.columns:
            fig_box = px.box(
                df,
                x="machinery_status",
                y="equipment_utilization_rate",
                color="machinery_status",
                title="🚜 Equipment Utilization Rate by Machinery Status",
                labels={"machinery_status": "Machinery Active (0 = Idle, 1 = Active)", "equipment_utilization_rate": "Utilization (%)"},
                color_discrete_map={0: "#f43f5e", 1: "#10b981"}
            )
            apply_plotly_theme(fig_box, height=330)
            st.plotly_chart(fig_box, use_container_width=True)
            
    with t2:
        if "cost_deviation" in df.columns and "time_deviation" in df.columns:
            fig_scat = px.scatter(
                df.sample(min(1200, len(df))),
                x="time_deviation",
                y="cost_deviation",
                color="risk_score" if "risk_score" in df.columns else None,
                color_continuous_scale="Turbo",
                title="💸 Cost Deviation ($) vs. Time Deviation (Hours)",
                labels={"time_deviation": "Time Deviation (Hours)", "cost_deviation": "Cost Deviation ($)"}
            )
            apply_plotly_theme(fig_scat, height=330)
            st.plotly_chart(fig_scat, use_container_width=True)
