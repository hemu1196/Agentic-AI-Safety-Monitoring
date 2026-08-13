import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import os
import sys

ENGINE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "agentic_engine")
if ENGINE_PATH not in sys.path:
    sys.path.append(ENGINE_PATH)

from database.db import get_connection, init_db
from utils import render_glass_card, apply_plotly_theme

def render_agentic_analytics_page():
    init_db()

    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">📊 Agentic Safety Database & Audit Analytics</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Real-time Inspection of SQLite `safety_events.db` Tables, Violations, Alerts, and Agent Reasoning Trails.</p>
    </div>
    """, unsafe_allow_html=True)

    conn = get_connection()
    try:
        df_workers = pd.read_sql_query("SELECT * FROM workers", conn)
        df_violations = pd.read_sql_query("SELECT * FROM violations", conn)
        df_alerts = pd.read_sql_query("SELECT * FROM alerts", conn)
        df_ppe = pd.read_sql_query("SELECT * FROM ppe_events", conn)
        df_actions = pd.read_sql_query("SELECT * FROM agent_actions", conn)
    finally:
        conn.close()

    total_workers = len(df_workers)
    total_violations = len(df_violations)
    total_alerts = len(df_alerts)
    total_actions = len(df_actions)

    # Metrics
    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown(render_glass_card("Screened Workers", f"{total_workers}", "Total registered workers", "👷", "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)"), unsafe_allow_html=True)
    with k2:
        st.markdown(render_glass_card("Total Violations", f"{total_violations}", "Logged PPE breaches", "🚨", "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"), unsafe_allow_html=True)
    with k3:
        st.markdown(render_glass_card("Active Alerts", f"{total_alerts}", "System safety alerts", "⚠️", "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"), unsafe_allow_html=True)
    with k4:
        st.markdown(render_glass_card("Agent Actions", f"{total_actions}", "Autonomous decisions", "🤖", "linear-gradient(135deg, #10b981 0%, #34d399 100%)"), unsafe_allow_html=True)

    st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)

    tab1, tab2, tab3, tab4 = st.tabs(["🚨 Violations Log", "🤖 Agent Actions Log", "🪖 PPE Events", "👷 Registered Workers"])

    with tab1:
        st.markdown("#### Violation Events Table")
        st.dataframe(df_violations, use_container_width=True)

        if not df_violations.empty and "type" in df_violations.columns:
            fig_v = px.histogram(
                df_violations,
                x="type",
                color="severity",
                title="Violations Count by Type & Severity",
                color_discrete_map={"high": "#f59e0b", "critical": "#ef4444", "warning": "#38bdf8"}
            )
            apply_plotly_theme(fig_v, height=320)
            st.plotly_chart(fig_v, use_container_width=True)

    with tab2:
        st.markdown("#### Autonomous Agent Reasoning & Actions Trail")
        st.dataframe(df_actions, use_container_width=True)

    with tab3:
        st.markdown("#### Raw PPE Events Telemetry")
        st.dataframe(df_ppe, use_container_width=True)

    with tab4:
        st.markdown("#### Worker Status Directory")
        st.dataframe(df_workers, use_container_width=True)
