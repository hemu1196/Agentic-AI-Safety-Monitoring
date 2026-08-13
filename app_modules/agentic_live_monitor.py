import streamlit as st
import cv2
import numpy as np
import os
import sys
import pandas as pd

ENGINE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "agentic_engine")
if ENGINE_PATH not in sys.path:
    sys.path.append(ENGINE_PATH)

import config
from database.db import init_db, log_violation, log_alert, log_agent_action, get_connection
from safety.ppe_rules import evaluate_ppe
from agent.action_router import route_all
from utils import render_glass_card, apply_plotly_theme

def render_agentic_live_monitor_page():
    init_db()

    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">🎥 Agentic Live Surveillance & Action Router</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Continuous Site Monitoring Powered by Autonomous Action Router Agent with Auto-Escalation.</p>
    </div>
    """, unsafe_allow_html=True)

    with st.expander("⚙️ Action Router Agent Policy & Controls", expanded=True):
        c1, c2, c3 = st.columns(3)
        with c1:
            repeat_violations = st.slider("Simulated Repeat Violation Count", 1, 5, 3, key="mon_repeat")
        with c2:
            cam_zone = st.selectbox("Select Surveillance Camera", ["CAM-01 (Entry Gate)", "CAM-02 (Tower Crane Zone A)", "CAM-03 (Scaffolding Sector 4)"])
        with c3:
            auto_escalate = st.checkbox("Auto-Escalate to Safety Lead", value=True)

    # Simulated worker violation for Action Router Agent test
    worker_id = 204
    ppe_test = {"helmet": False, "vest": True}
    eval_res = evaluate_ppe(ppe_test)

    decisions = []
    if eval_res["violations"]:
        for v in eval_res["violations"]:
            log_violation(worker_id, v["type"], v["severity"], camera_id=cam_zone)
        decisions = route_all(worker_id, eval_res["violations"], repeat_counts={"no_helmet": repeat_violations})
        for d in decisions:
            log_alert(worker_id, d.event_type, d.severity)
            log_agent_action(worker_id, d.reasoning_summary, d.recommended_action, d.severity)

    # Metrics
    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown(render_glass_card("Monitored Camera", cam_zone.split()[0], "Active video stream", "📹", "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)"), unsafe_allow_html=True)
    with k2:
        st.markdown(render_glass_card("Active Workers", "12", "Zone footprint count", "👷", "linear-gradient(135deg, #10b981 0%, #34d399 100%)"), unsafe_allow_html=True)
    with k3:
        st.markdown(render_glass_card("Agent Severity", decisions[0].severity.upper() if decisions else "NORMAL", "Action Router state", "🚨", "linear-gradient(135deg, #ef4444 0%, #f87171 100%)" if decisions and decisions[0].severity=="critical" else "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"), unsafe_allow_html=True)
    with k4:
        st.markdown(render_glass_card("Repeat Offenses", f"{repeat_violations}x", "Auto-escalation count", "🔄", "linear-gradient(135deg, #c084fc 0%, #e879f9 100%)"), unsafe_allow_html=True)

    st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)
    st.markdown("### 🤖 Autonomous Agentic Decision & Action Router Stream")

    if decisions:
        for d in decisions:
            st.markdown(f"""
            <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid {'rgba(239, 68, 68, 0.5)' if d.severity=='critical' else 'rgba(245, 158, 11, 0.5)'}; border-radius: 14px; padding: 20px; margin-bottom: 14px;">
                <div style="font-size: 0.8rem; font-weight: 700; color: {'#ef4444' if d.severity=='critical' else '#f59e0b'}; text-transform: uppercase;">AGENT REASONING SUMMARY ({d.severity.upper()})</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: #f8fafc; margin: 6px 0;">{d.reasoning_summary}</div>
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px 14px; color: #38bdf8; font-weight: 600; font-size: 0.9rem;">
                    🎯 <strong>Recommended Action:</strong> {d.recommended_action}
                </div>
            </div>
            """, unsafe_allow_html=True)

    # Query recent agent actions from SQLite DB
    st.markdown("### 📋 SQLite `agent_actions` Audit Table")
    conn = get_connection()
    try:
        df_actions = pd.read_sql_query("SELECT id, worker_id, severity, reasoning_summary, recommended_action, timestamp FROM agent_actions ORDER BY id DESC LIMIT 10", conn)
        st.dataframe(df_actions, use_container_width=True)
    finally:
        conn.close()
