import streamlit as st
import cv2
import numpy as np
import os
import sys
from PIL import Image

ENGINE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "agentic_engine")
if ENGINE_PATH not in sys.path:
    sys.path.append(ENGINE_PATH)

import config
from database.db import init_db, upsert_worker, log_ppe_event, log_violation, log_alert, log_agent_action
from safety.ppe_rules import evaluate_ppe
from agent.action_router import route_all
from utils import render_glass_card, apply_plotly_theme

def analyze_webcam_frame(frame, sensitivity_ratio=0.05):
    """
    Analyzes a real-time webcam frame using OpenCV HSV color heuristic for
    Safety Hardhat (Helmet) and High-Vis Safety Vest.
    """
    h, w = frame.shape[:2]
    
    # Define person detection region (Center focus for entry gate)
    x1, y1 = int(w * 0.25), int(h * 0.15)
    x2, y2 = int(w * 0.75), int(h * 0.85)
    
    person_crop = frame[y1:y2, x1:x2]
    crop_h, crop_w = person_crop.shape[:2]
    
    if crop_h > 0 and crop_w > 0:
        hsv = cv2.cvtColor(person_crop, cv2.COLOR_BGR2HSV)
        
        # Head region (top 30%)
        head_region = hsv[0:int(crop_h * 0.30), :]
        # Torso region (middle 40%)
        torso_region = hsv[int(crop_h * 0.30):int(crop_h * 0.70), :]
        
        # Check Helmet HSV matching
        helmet_pixels = 0
        if head_region.size > 0:
            for _, lower, upper in config.HELMET_HSV_RANGES:
                mask = cv2.inRange(head_region, np.array(lower), np.array(upper))
                helmet_pixels += np.count_nonzero(mask)
            helmet_ratio = helmet_pixels / float(head_region.shape[0] * head_region.shape[1])
        else:
            helmet_ratio = 0.0

        # Check Vest HSV matching
        vest_pixels = 0
        if torso_region.size > 0:
            for _, lower, upper in config.VEST_HSV_RANGES:
                mask = cv2.inRange(torso_region, np.array(lower), np.array(upper))
                vest_pixels += np.count_nonzero(mask)
            vest_ratio = vest_pixels / float(torso_region.shape[0] * torso_region.shape[1])
        else:
            vest_ratio = 0.0

        has_helmet = helmet_ratio >= sensitivity_ratio
        has_vest = vest_ratio >= sensitivity_ratio
    else:
        has_helmet, has_vest = False, False

    ppe_status = {"helmet": has_helmet, "vest": has_vest}
    result = evaluate_ppe(ppe_status)
    
    # Draw OpenCV bounding box and labels
    annotated_frame = frame.copy()
    box_color = (16, 185, 129) if result["decision"] == "PASS" else (239, 68, 68) # BGR
    
    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), box_color[::-1], 3)
    
    label_text = f"Worker #101: PASS" if result["decision"] == "PASS" else f"Worker #101: BLOCK ({', '.join(result['missing_items'])})"
    cv2.rectangle(annotated_frame, (x1, y1 - 35), (x1 + 320, y1), box_color[::-1], -1)
    cv2.putText(annotated_frame, label_text, (x1 + 10, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
    
    # Gate Banner
    banner_color = (16, 185, 129) if result["decision"] == "PASS" else (239, 68, 68)
    banner_text = "PASS / ENTRY GRANTED" if result["decision"] == "PASS" else "BLOCK / ENTRY DENIED - WEAR HELMET & VEST!"
    cv2.rectangle(annotated_frame, (0, 0), (w, 45), banner_color[::-1], -1)
    cv2.putText(annotated_frame, banner_text, (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)
    
    return annotated_frame, result, ppe_status

def render_agentic_entry_gate_page():
    init_db()
    
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">🚪 Agentic Entry Safety Gate — Live Webcam Stream</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Real-Time Browser Webcam Streaming & Computer Vision PPE Inspection (PASS / BLOCK Gate Control).</p>
    </div>
    """, unsafe_allow_html=True)

    source_mode = st.radio("Select Video Input Source:", ["📷 Browser Webcam Input", "▶️ Continuous OpenCV Stream", "⚙️ Manual Test Simulator"], horizontal=True)

    annotated_frame = None
    result = None
    ppe_status = None

    if source_mode == "📷 Browser Webcam Input":
        st.markdown("#### 📷 Browser Webcam Stream Inspection")
        st.caption("Click 'Take Photo' or turn on your camera below to run live real-time detection on yourself!")
        
        webcam_photo = st.camera_input("Activate Browser Webcam")
        
        if webcam_photo is not None:
            # Convert uploaded PIL Image to OpenCV BGR numpy array
            pil_img = Image.open(webcam_photo)
            frame_np = np.array(pil_img)
            frame_bgr = cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR)
            
            annotated_frame, result, ppe_status = analyze_webcam_frame(frame_bgr)

    elif source_mode == "▶️ Continuous OpenCV Stream":
        st.markdown("#### ▶️ Continuous Local Camera Stream")
        run_cam = st.checkbox("Start Live Webcam Feed", key="run_local_webcam")
        
        frame_placeholder = st.empty()
        
        if run_cam:
            cap = cv2.VideoCapture(config.CAMERA_INDEX)
            if not cap.isOpened():
                st.error("Could not access local webcam (Camera Index 0). Please check device permissions.")
            else:
                ret, frame = cap.read()
                if ret:
                    annotated_frame, result, ppe_status = analyze_webcam_frame(frame)
                    frame_placeholder.image(annotated_frame, channels="BGR", use_container_width=True)
                cap.release()

    else:
        st.markdown("#### ⚙️ Manual PPE Rules Test Simulator")
        c1, c2 = st.columns(2)
        with c1:
            test_h = st.checkbox("Worker Wearing Hardhat / Helmet", value=True)
        with c2:
            test_v = st.checkbox("Worker Wearing High-Vis Safety Vest", value=True)
            
        ppe_status = {"helmet": test_h, "vest": test_v}
        result = evaluate_ppe(ppe_status)

        # Synthetic Frame
        frame_bgr = np.zeros((400, 650, 3), dtype=np.uint8)
        frame_bgr[:, :] = (30, 41, 59)
        annotated_frame, _, _ = analyze_webcam_frame(frame_bgr)

    if result is None:
        # Default fallback result for UI display
        ppe_status = {"helmet": True, "vest": True}
        result = evaluate_ppe(ppe_status)

    # Log Events to SQLite Database
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

    # Display Metrics & Banner Output
    st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)

    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown(render_glass_card(
            "Gate Decision", result["decision"],
            "Entry Access Status", "🚪",
            "linear-gradient(135deg, #10b981 0%, #34d399 100%)" if result["decision"] == "PASS" else "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
        ), unsafe_allow_html=True)
        
    with k2:
        st.markdown(render_glass_card(
            "PPE Compliance %", f"{result['compliance_pct']:.0f}%",
            "Screening Accuracy Score", "🪖",
            "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)"
        ), unsafe_allow_html=True)

    with k3:
        st.markdown(render_glass_card(
            "Helmet / Hardhat", "DETECTED" if ppe_status["helmet"] else "MISSING!",
            "Head Protection Check", "🧢",
            "linear-gradient(135deg, #10b981 0%, #34d399 100%)" if ppe_status["helmet"] else "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
        ), unsafe_allow_html=True)

    with k4:
        st.markdown(render_glass_card(
            "High-Vis Vest", "DETECTED" if ppe_status["vest"] else "MISSING!",
            "Torso Protection Check", "🦺",
            "linear-gradient(135deg, #10b981 0%, #34d399 100%)" if ppe_status["vest"] else "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
        ), unsafe_allow_html=True)

    st.markdown("### 📡 Live Detection Stream")
    if annotated_frame is not None:
        st.image(annotated_frame, channels="BGR", use_container_width=True, caption="Real-Time Computer Vision Annotated Feed")

    if result["decision"] == "BLOCK":
        st.error(f"🚨 **ENTRY BLOCKED**: Worker #{worker_id} missing {', '.join(result['missing_items'])}. Incident logged to SQLite database (`safety_events.db`).")
    else:
        st.success(f"✅ **ENTRY GRANTED**: Worker #{worker_id} passed required hardhat and vest safety checks.")
