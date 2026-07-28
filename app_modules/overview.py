import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np

def render_overview_page(df):
    st.markdown("## 🏗️ Executive Operational Overview")
    st.markdown("Real-time telemetry indicators and summary analytics for ongoing construction projects.")
    
    if df is None:
        st.warning("Dataset unavailable. Please check data source.")
        return
        
    total_records = len(df)
    avg_risk = df['risk_score'].mean() if 'risk_score' in df.columns else 0
    avg_equip_util = df['equipment_utilization_rate'].mean() if 'equipment_utilization_rate' in df.columns else 0
    total_safety = df['safety_incidents'].sum() if 'safety_incidents' in df.columns else 0
    shortage_alerts = df['material_shortage_alert'].sum() if 'material_shortage_alert' in df.columns else 0
    avg_cost_dev = df['cost_deviation'].mean() if 'cost_deviation' in df.columns else 0

    # Top KPI Metrics Cards
    c1, c2, c3, c4, c5 = st.columns(5)
    with c1:
        st.metric("Total Site Logs", f"{total_records:,}")
    with c2:
        st.metric("Avg Risk Score", f"{avg_risk:.1f}", delta=f"{'-' if avg_risk > 30 else '+'}{avg_risk:.1f}", delta_color="inverse")
    with c3:
        st.metric("Equipment Utilization", f"{avg_equip_util:.1f}%")
    with c4:
        st.metric("Material Shortages", f"{shortage_alerts:,}", delta=f"{shortage_alerts} sites", delta_color="inverse")
    with c5:
        st.metric("Safety Incidents", f"{int(total_safety):,}", delta=f"{int(total_safety)} logged", delta_color="inverse")

    st.markdown("---")

    col_left, col_right = st.columns([6, 4])
    
    with col_left:
        st.subheader("📈 Project Risk Score Distribution")
        fig_hist = px.histogram(
            df,
            x="risk_score",
            nbins=40,
            color_discrete_sequence=["#3b82f6"],
            title="Distribution of Construction Risk Scores",
            labels={"risk_score": "Risk Score (0-100)"}
        )
        fig_hist.update_layout(
            template="plotly_dark",
            margin=dict(l=20, r=20, t=40, b=20),
            height=320
        )
        st.plotly_chart(fig_hist, use_container_width=True)

    with col_right:
        st.subheader("💡 Optimization Suggestions Breakdown")
        if "optimization_suggestion" in df.columns:
            opt_counts = df["optimization_suggestion"].value_counts().reset_index()
            opt_counts.columns = ["Suggestion", "Count"]
            fig_pie = px.pie(
                opt_counts,
                names="Suggestion",
                values="Count",
                color_discrete_sequence=px.colors.qualitative.Pastel,
                hole=0.4
            )
            fig_pie.update_layout(
                template="plotly_dark",
                margin=dict(l=20, r=20, t=40, b=20),
                height=320
            )
            st.plotly_chart(fig_pie, use_container_width=True)

    st.markdown("### 📊 Operational Telemetry Overview")
    t1, t2 = st.columns(2)
    
    with t1:
        st.markdown("#### Equipment Utilization vs. Machinery Status")
        if "equipment_utilization_rate" in df.columns and "machinery_status" in df.columns:
            fig_box = px.box(
                df,
                x="machinery_status",
                y="equipment_utilization_rate",
                color="machinery_status",
                labels={"machinery_status": "Machinery Active (0=Idle, 1=Active)", "equipment_utilization_rate": "Utilization (%)"},
                color_discrete_map={0: "#ef4444", 1: "#10b981"}
            )
            fig_box.update_layout(template="plotly_dark", height=300)
            st.plotly_chart(fig_box, use_container_width=True)
            
    with t2:
        st.markdown("#### Cost Deviation vs. Time Deviation")
        if "cost_deviation" in df.columns and "time_deviation" in df.columns:
            fig_scat = px.scatter(
                df.sample(min(1000, len(df))),
                x="time_deviation",
                y="cost_deviation",
                color="risk_score" if "risk_score" in df.columns else None,
                color_continuous_scale="Viridis",
                labels={"time_deviation": "Time Deviation (Hours)", "cost_deviation": "Cost Deviation ($)"}
            )
            fig_scat.update_layout(template="plotly_dark", height=300)
            st.plotly_chart(fig_scat, use_container_width=True)
