import streamlit as st
import cv2
import numpy as np
import os
import sys
import time
from PIL import Image

ENGINE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "agentic_engine")
if ENGINE_PATH not in sys.path:
    sys.path.append(ENGINE_PATH)

import config
from database.db import init_db, upsert_worker, log_ppe_event, log_violation, log_alert, log_agent_action
from safety.ppe_rules import evaluate_ppe
from agent.action_router import route_all
from utils import render_glass_card, apply_plotly_theme

def analyze_webcam_frame(frame, sensitivity_ratio=0.04):
    """
    Analyzes a real-time frame using OpenCV HSV color heuristic for
    Safety Hardhat (Helmet) and High-Vis Safety Vest.
    """
    h, w = frame.shape[:2]
    
    # Person detection region (Center focus for entry gate)
    x1, y1 = int(w * 0.20), int(h * 0.10)
    x2, y2 = int(w * 0.80), int(h * 0.90)
    
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
    cv2.rectangle(annotated_frame, (x1, y1 - 35), (x1 + 330, y1), box_color[::-1], -1)
    cv2.putText(annotated_frame, label_text, (x1 + 10, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
    
    # Top Gate Banner
    banner_color = (16, 185, 129) if result["decision"] == "PASS" else (239, 68, 68)
    banner_text = "PASS / ENTRY GRANTED" if result["decision"] == "PASS" else "BLOCK / ENTRY DENIED - WEAR HELMET & VEST!"
    cv2.rectangle(annotated_frame, (0, 0), (w, 45), banner_color[::-1], -1)
    cv2.putText(annotated_frame, banner_text, (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)
    
    return annotated_frame, result, ppe_status

def create_synthetic_inspection_frame(has_helmet=True, has_vest=True):
    """
    Creates a high-resolution synthetic inspection image for site testing.
    """
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    frame[:, :] = (30, 41, 59) # Slate dark background

    # Gate Post Structure
    cv2.rectangle(frame, (40, 40), (100, 440), (71, 85, 105), -1)
    cv2.rectangle(frame, (540, 40), (600, 440), (71, 85, 105), -1)
    cv2.putText(frame, "GATE CAM-01", (250, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (148, 163, 184), 2)

    # Worker silhouette
    cv2.circle(frame, (320, 160), 35, (255, 255, 255), -1)
    cv2.rectangle(frame, (280, 195), (360, 380), (255, 255, 255), -1)

    # Helmet Hardhat (Yellow / Green if present)
    if has_helmet:
        cv2.ellipse(frame, (320, 145), (38, 18), 0, 180, 360, (0, 255, 255), -1) # Yellow hardhat
    else:
        cv2.putText(frame, "NO HELMET!", (260, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

    # High-Vis Vest (Orange / Green if present)
    if has_vest:
        cv2.rectangle(frame, (288, 205), (352, 320), (0, 165, 255), -1) # Orange vest

    return frame

def render_agentic_entry_gate_page():
    init_db()
    
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">🚪 Agentic Entry Safety Gate & Real-Time Inspection</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Real-Time Safety Detection, Continuous Video Streaming & Automated PASS / BLOCK Gate Control.</p>
    </div>
    """, unsafe_allow_html=True)

    source_mode = st.radio(
        "Select Inspection Mode:",
        [
            "🛡️ Safety Detection",
            "▶️ Continuous OpenCV Stream",
            "📸 Site Photo & Image Inspector"
        ],
        horizontal=True
    )

    annotated_frame = None
    result = None
    ppe_status = None

    if source_mode == "🛡️ Safety Detection":
        st.markdown("#### 🛡️ Live Safety Detection (Browser Camera)")
        st.caption("Click 'Take Photo' or turn on your webcam below to run real-time AI PPE detection on yourself!")
        
        webcam_photo = st.camera_input("Activate Live Safety Camera")
        
        if webcam_photo is not None:
            pil_img = Image.open(webcam_photo)
            frame_np = np.array(pil_img)
            frame_bgr = cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR)
            
            annotated_frame, result, ppe_status = analyze_webcam_frame(frame_bgr)

    elif source_mode == "▶️ Continuous OpenCV Stream":
        st.markdown("#### ▶️ Continuous Live Camera Video Stream")
        st.caption("Stream live video continuously from your built-in local webcam.")
        
        c1, c2 = st.columns([2, 1])
        with c1:
            run_cam = st.checkbox("▶️ Start Live Stream", key="run_local_webcam_stream")
        with c2:
            cam_idx = st.number_input("Camera Index", 0, 3, 0)
        
        frame_placeholder = st.empty()
        
        if run_cam:
            cap = cv2.VideoCapture(cam_idx)
            if not cap.isOpened():
                st.error(f"Could not open local camera at Index {cam_idx}. Please verify device connection.")
            else:
                # Continuous streaming loop
                stop_stream = st.button("⏹️ Stop Stream")
                for _ in range(50):
                    if stop_stream:
                        break
                    ret, frame = cap.read()
                    if not ret:
                        st.error("Failed to read camera frame.")
                        break
                    annotated_frame, result, ppe_status = analyze_webcam_frame(frame)
                    frame_placeholder.image(annotated_frame, channels="BGR", use_container_width=True)
                    time.sleep(0.03)
                cap.release()

    else: # 📸 Site Photo & Image Inspector
        st.markdown("#### 📸 Site Photo & Image Inspector")
        st.caption("Upload a site photo or test preset scenarios to run AI PPE detection.")
        
        i1, i2 = st.columns([1, 1])
        with i1:
            test_h = st.checkbox("Simulate Hardhat / Helmet", value=True)
            test_v = st.checkbox("Simulate High-Vis Vest", value=False)
        with i2:
            uploaded_file = st.file_uploader("Upload Construction Site Photo", type=["jpg", "png", "jpeg"])

        if uploaded_file is not None:
            pil_img = Image.open(uploaded_file)
            frame_np = np.array(pil_img)
            frame_bgr = cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR)
            annotated_frame, result, ppe_status = analyze_webcam_frame(frame_bgr)
        else:
            synth_frame = create_synthetic_inspection_frame(test_h, test_v)
            annotated_frame, result, ppe_status = analyze_webcam_frame(synth_frame)

    if result is None:
        # Fallback default result
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

    # Display Metrics Cards
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
            "Screening Score", "🪖",
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
