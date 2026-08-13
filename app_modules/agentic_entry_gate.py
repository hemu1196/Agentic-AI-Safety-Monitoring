import streamlit as st
import cv2
import numpy as np
import os
import sys
import time
from datetime import datetime
from PIL import Image

ENGINE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "agentic_engine")
if ENGINE_PATH not in sys.path:
    sys.path.append(ENGINE_PATH)

import config
from database.db import init_db, upsert_worker, log_ppe_event, log_violation, log_alert, log_agent_action, get_connection
from safety.ppe_rules import evaluate_ppe
from agent.action_router import route_all
from utils import render_glass_card, apply_plotly_theme

# Ensure captured_workers directory exists
SAVE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "captured_workers")
os.makedirs(SAVE_DIR, exist_ok=True)

def save_worker_snapshot(frame_bgr, worker_id):
    """
    Saves the annotated worker frame as worker_1_TIMESTAMP.jpg in captured_workers/
    and returns the saved file path.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"worker_{worker_id}_{timestamp}.jpg"
    filepath = os.path.join(SAVE_DIR, filename)
    
    cv2.imwrite(filepath, frame_bgr)
    return filepath, filename, timestamp

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
    
    label_text = f"Worker #{st.session_state.get('worker_counter', 1)}: PASS" if result["decision"] == "PASS" else f"Worker #{st.session_state.get('worker_counter', 1)}: BLOCK ({', '.join(result['missing_items'])})"
    cv2.rectangle(annotated_frame, (x1, y1 - 35), (x1 + 340, y1), box_color[::-1], -1)
    cv2.putText(annotated_frame, label_text, (x1 + 10, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
    
    # Top Gate Banner
    banner_color = (16, 185, 129) if result["decision"] == "PASS" else (239, 68, 68)
    banner_text = "PASS / ENTRY GRANTED" if result["decision"] == "PASS" else "BLOCK / ENTRY DENIED - WEAR HELMET & VEST!"
    cv2.rectangle(annotated_frame, (0, 0), (w, 45), banner_color[::-1], -1)
    cv2.putText(annotated_frame, banner_text, (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)
    
    return annotated_frame, result, ppe_status

def create_synthetic_inspection_frame(has_helmet=True, has_vest=True):
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    frame[:, :] = (30, 41, 59) # Slate dark background

    cv2.rectangle(frame, (40, 40), (100, 440), (71, 85, 105), -1)
    cv2.rectangle(frame, (540, 40), (600, 440), (71, 85, 105), -1)
    cv2.putText(frame, "GATE CAM-01", (250, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (148, 163, 184), 2)

    cv2.circle(frame, (320, 160), 35, (255, 255, 255), -1)
    cv2.rectangle(frame, (280, 195), (360, 380), (255, 255, 255), -1)

    if has_helmet:
        cv2.ellipse(frame, (320, 145), (38, 18), 0, 180, 360, (0, 255, 255), -1) # Yellow hardhat
    else:
        cv2.putText(frame, "NO HELMET!", (260, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

    if has_vest:
        cv2.rectangle(frame, (288, 205), (352, 320), (0, 165, 255), -1) # Orange vest

    return frame

def render_agentic_entry_gate_page():
    init_db()
    
    if "worker_counter" not in st.session_state:
        st.session_state.worker_counter = 1

    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">🚪 Agentic Entry Safety Gate & Auto-Save Worker Photos</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Real-Time Safety Detection, Auto-Saving Worker Photos (<code>worker_1_TIMESTAMP.jpg</code>) to SQLite Database.</p>
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
    saved_filepath = ""

    if source_mode == "🛡️ Safety Detection":
        st.markdown("#### 🛡️ Live Safety Detection (Browser Camera)")
        st.caption("Click 'Take Photo' below to run real-time AI PPE detection and automatically save worker photos as `worker_1`, `worker_2`...")
        
        webcam_photo = st.camera_input("Activate Live Safety Camera")
        
        if webcam_photo is not None:
            pil_img = Image.open(webcam_photo)
            frame_np = np.array(pil_img)
            frame_bgr = cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR)
            
            annotated_frame, result, ppe_status = analyze_webcam_frame(frame_bgr)
            
            # Auto-Save Worker Image Frame to disk
            curr_id = st.session_state.worker_counter
            saved_filepath, filename, ts = save_worker_snapshot(annotated_frame, curr_id)
            st.session_state.worker_counter += 1

    elif source_mode == "▶️ Continuous OpenCV Stream":
        st.markdown("#### ▶️ Continuous Live Camera Video Stream")
        st.caption("Stream live video continuously from local webcam and capture worker snapshots.")
        
        c1, c2 = st.columns([2, 1])
        with c1:
            run_cam = st.checkbox("▶️ Start Live Stream", key="run_local_webcam_stream")
        with c2:
            cam_idx = st.number_input("Camera Index", 0, 3, 0)
        
        frame_placeholder = st.empty()
        
        if run_cam:
            cap = cv2.VideoCapture(cam_idx)
            if not cap.isOpened():
                st.error(f"Could not open local camera at Index {cam_idx}.")
            else:
                stop_stream = st.button("⏹️ Stop Stream")
                for _ in range(30):
                    if stop_stream:
                        break
                    ret, frame = cap.read()
                    if not ret:
                        break
                    annotated_frame, result, ppe_status = analyze_webcam_frame(frame)
                    frame_placeholder.image(annotated_frame, channels="BGR", use_container_width=True)
                    time.sleep(0.03)
                    
                if annotated_frame is not None:
                    curr_id = st.session_state.worker_counter
                    saved_filepath, filename, ts = save_worker_snapshot(annotated_frame, curr_id)
                    st.session_state.worker_counter += 1
                cap.release()

    else: # 📸 Site Photo & Image Inspector
        st.markdown("#### 📸 Site Photo & Image Inspector")
        st.caption("Upload site photo or simulate worker inspection and auto-save snapshot.")
        
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

        if st.button("📸 Capture & Auto-Save Worker Snapshot"):
            curr_id = st.session_state.worker_counter
            saved_filepath, filename, ts = save_worker_snapshot(annotated_frame, curr_id)
            st.session_state.worker_counter += 1
            st.success(f"💾 Saved worker snapshot as `{filename}` in `captured_workers/`!")

    if result is None:
        ppe_status = {"helmet": True, "vest": True}
        result = evaluate_ppe(ppe_status)

    # Log Events to SQLite Database with saved photo path
    worker_id = st.session_state.worker_counter - 1 if st.session_state.worker_counter > 1 else 1
    upsert_worker(worker_id, result["decision"], photo_path=saved_filepath)
    log_ppe_event(worker_id, ppe_status, photo_path=saved_filepath)

    if result["violations"]:
        for v in result["violations"]:
            log_violation(worker_id, v["type"], v["severity"], evidence=saved_filepath)
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
            f"Worker worker_{worker_id}", "🚪",
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
        st.image(annotated_frame, channels="BGR", use_container_width=True, caption=f"Real-Time Inspection Stream (worker_{worker_id})")

    if saved_filepath and os.path.exists(saved_filepath):
        st.info(f"📁 **Auto-Saved Image**: `{saved_filepath}`")

    if result["decision"] == "BLOCK":
        st.error(f"🚨 **ENTRY BLOCKED**: worker_{worker_id} missing {', '.join(result['missing_items'])}. Image and incident saved to SQLite database (`safety_events.db`).")
    else:
        st.success(f"✅ **ENTRY GRANTED**: worker_{worker_id} passed required hardhat and vest safety checks.")

    # Render Saved Worker History Gallery
    st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)
    st.markdown("### 📸 Auto-Saved Worker Photos & Inspection History")

    if os.path.exists(SAVE_DIR):
        files = sorted([f for f in os.listdir(SAVE_DIR) if f.endswith(".jpg") or f.endswith(".png")], reverse=True)
        if files:
            cols = st.columns(4)
            for idx, img_file in enumerate(files[:8]):
                img_path = os.path.join(SAVE_DIR, img_file)
                with cols[idx % 4]:
                    st.image(img_path, use_container_width=True, caption=img_file)
                    with open(img_path, "rb") as file_bytes:
                        st.download_button(
                            label=f"📥 Download {img_file[:12]}...",
                            data=file_bytes,
                            file_name=img_file,
                            mime="image/jpeg",
                            key=f"dl_{img_file}_{idx}"
                        )
        else:
            st.caption("No saved worker photos yet. Take a photo or run live camera detection to auto-save!")
