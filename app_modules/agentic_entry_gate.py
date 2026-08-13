import streamlit as st
import cv2
import numpy as np
import os
import sys
from PIL import Image

# Ensure agentic_engine path is accessible
ENGINE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "agentic_engine")
if ENGINE_PATH not in sys.path:
    sys.path.append(ENGINE_PATH)

import config
from database.db import init_db, upsert_worker, log_ppe_event, log_violation, log_alert, log_agent_action
from safety.ppe_rules import evaluate_ppe
from agent.action_router import route_all
from utils import render_glass_card, apply_plotly_theme

def render_agentic_entry_gate_page():
    init_db()
    
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">🚪 Agentic Entry Safety Gate (CAM-01)</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Automated Worker Screening at Entry Gate with Real-Time PASS / BLOCK Gate Control & Violation Logging.</p>
    </div>
    """, unsafe_allow_html=True)

    c1, c2 = st.columns([1, 1])
    with c1:
        gate_mode = st.radio("Screening Source:", ["Simulated Safety Gate Feed", "Webcam Live Stream"], horizontal=True)
    with c2:
        test_helmet = st.checkbox("Simulate Worker Hardhat / Helmet", value=True)
        test_vest = st.checkbox("Simulate Worker High-Vis Vest", value=True)

    # Evaluate PPE Status
    ppe_status = {"helmet": test_helmet, "vest": test_vest}
    result = evaluate_ppe(ppe_status)

    # Log to SQLite DB
    worker_id = 101
    upsert_worker(worker_id, result["decision"])
    log_ppe_event(worker_id, ppe_status)

    if result["violations"]:
        for v in result["violations"]:
            log_violation(worker_id, v["type"], v["severity"])
        decisions = route_all(worker_id, result["violations"])
        for d in decisions:
            log_alert(worker_id, d.event_type, d.severity)
            log_agent_action(worker_id, d.reasoning_summary, d.recommended_action, d.severity)

    # Render PASS / BLOCK Banners & Metrics
    st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)

    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown(render_glass_card(
            "Entry Gate Decision", result["decision"],
            "Gate Access Status", "🚪",
            "linear-gradient(135deg, #10b981 0%, #34d399 100%)" if result["decision"] == "PASS" else "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
        ), unsafe_allow_html=True)
        
    with k2:
        st.markdown(render_glass_card(
            "PPE Compliance", f"{result['compliance_pct']:.0f}%",
            "Required Items Checked", "🪖",
            "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)"
        ), unsafe_allow_html=True)

    with k3:
        st.markdown(render_glass_card(
            "Helmet Hardhat", "DETECTED" if test_helmet else "MISSING!",
            "Head Protection", "🧢",
            "linear-gradient(135deg, #10b981 0%, #34d399 100%)" if test_helmet else "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
        ), unsafe_allow_html=True)

    with k4:
        st.markdown(render_glass_card(
            "High-Vis Vest", "DETECTED" if test_vest else "MISSING!",
            "Body Protection", "🦺",
            "linear-gradient(135deg, #10b981 0%, #34d399 100%)" if test_vest else "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
        ), unsafe_allow_html=True)

    # Render Visual Frame & Gate Banner
    st.markdown("### 📡 Live Gate Screening Feed")

    # Generate Synthetic Gate Image Frame
    frame = np.zeros((400, 700, 3), dtype=np.uint8)
    frame[:, :] = (30, 41, 59) # Dark slate background

    # Gate Post Structure
    cv2.rectangle(frame, (50, 50), (120, 350), (71, 85, 105), -1)
    cv2.rectangle(frame, (580, 50), (650, 350), (71, 85, 105), -1)

    # Gate Barrier Arm (Green if PASS, Red if BLOCK)
    barrier_color = (16, 185, 129) if result["decision"] == "PASS" else (239, 68, 68)
    cv2.rectangle(frame, (120, 180), (580, 205), barrier_color[::-1], -1)

    # Worker silhouette
    cv2.circle(frame, (350, 130), 25, (255, 255, 255), -1)
    cv2.rectangle(frame, (325, 155), (375, 240), (255, 255, 255), -1)

    # Helmet & Vest overlays
    if test_helmet:
        cv2.ellipse(frame, (350, 120), (28, 14), 0, 180, 360, (16, 185, 129)[::-1], -1) # Green hardhat
    else:
        cv2.putText(frame, "NO HELMET!", (300, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (239, 68, 68)[::-1], 2)

    if test_vest:
        cv2.rectangle(frame, (330, 160), (370, 210), (16, 185, 129)[::-1], -1) # Green vest

    # Top Banner
    banner_color = (16, 185, 129) if result["decision"] == "PASS" else (239, 68, 68)
    banner_text = "PASS / ENTRY ALLOWED" if result["decision"] == "PASS" else "BLOCK / ENTRY DENIED - WEAR REQUIRED PPE!"
    cv2.rectangle(frame, (0, 0), (700, 45), banner_color[::-1], -1)
    cv2.putText(frame, banner_text, (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)

    st.image(frame, channels="BGR", use_container_width=True)

    if result["decision"] == "BLOCK":
        st.error(f"🚨 **GATE ENTRY BLOCKED**: Worker #{worker_id} is missing {', '.join(result['missing_items'])}. Violation logged to SQLite database (`safety_events.db`).")
    else:
        st.success(f"✅ **ENTRY GRANTED**: Worker #{worker_id} passed all required PPE screening rules.")
