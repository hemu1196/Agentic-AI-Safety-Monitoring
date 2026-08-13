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
    Analyzes a real-time frame with OpenCV HSV color heuristics for
    Hardhat (Helmet) and High-Vis Safety Vest.
    """
    h, w = frame.shape[:2]
    
    # Person detection region (Center focus for entry gate / surveillance)
    x1, y1 = int(w * 0.20), int(h * 0.15)
    x2, y2 = int(w * 0.80), int(h * 0.85)
    
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

    # Draw OpenCV bounding box and overlays
    annotated_frame = frame.copy()
    box_color = (16, 185, 129) if result["decision"] == "PASS" else (239, 68, 68) # BGR

    # Draw Worker Bounding Box (Green if PASS, Red if BLOCK)
    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), box_color[::-1], 3)
    
    # Overhead Label Tag: "Worker #1: WEAR HELMET!" if no helmet
    curr_worker_num = st.session_state.get('worker_counter', 1)
    if has_helmet:
        label_text = f"Worker #{curr_worker_num}: HELMET OK"
    else:
        label_text = f"Worker #{curr_worker_num}: WEAR HELMET! 🚨"

    cv2.rectangle(annotated_frame, (x1, y1 - 38), (x1 + 340, y1), box_color[::-1], -1)
    cv2.putText(annotated_frame, label_text, (x1 + 10, y1 - 12), cv2.FONT_HERSHEY_SIMPLEX, 0.58, (255, 255, 255), 2)

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
        cv2.putText(frame, "WEAR HELMET!", (240, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 0, 255), 2)

    if has_vest:
        cv2.rectangle(frame, (288, 205), (352, 320), (0, 165, 255), -1) # Orange vest

    return frame

def render_agentic_entry_gate_page():
    init_db()
    
    if "worker_counter" not in st.session_state:
        st.session_state.worker_counter = 1

    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">🚪 Agentic Entry Safety Gate & Real-Time Inspection</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Live Helmet Detection ("WEAR HELMET!"), Auto-Save Photos & Agentic AI Field Directives.</p>
    </div>
    """, unsafe_allow_html=True)

    # Top Control Bar: Camera Power Switch (ON / OFF)
    cp_col1, cp_col2 = st.columns([3, 2])
    with cp_col1:
        camera_power = st.toggle("🔌 Camera Power Switch (ON / OFF to Save Battery Charge)", value=True, key="camera_power_switch")
    with cp_col2:
        if camera_power:
            st.markdown("<div style='background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 20px; padding: 6px 16px; color: #34d399; font-weight: 700; font-size: 0.85rem; display: inline-block;'>🟢 CAMERA POWER: ON (AI Active)</div>", unsafe_allow_html=True)
        else:
            st.markdown("<div style='background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 20px; padding: 6px 16px; color: #f87171; font-weight: 700; font-size: 0.85rem; display: inline-block;'>🔴 CAMERA POWER: OFF (Battery Saver Active)</div>", unsafe_allow_html=True)

    st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)

    if not camera_power:
        st.markdown("""
        <div style="background: rgba(30, 41, 59, 0.7); border: 2px dashed rgba(239, 68, 68, 0.4); border-radius: 18px; padding: 32px; text-align: center; margin: 20px 0;">
            <div style="font-size: 3rem; margin-bottom: 8px;">🔋🔌</div>
            <div style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; font-weight: 800; color: #f87171;">CAMERA POWER SAVER IS ACTIVE</div>
            <div style="color: #94a3b8; font-size: 0.95rem; margin-top: 6px;">Camera hardware and AI Computer Vision detection are switched OFF to conserve device battery power.</div>
            <div style="margin-top: 14px; font-weight: 600; color: #38bdf8;">Toggle the "Camera Power Switch" ON above to resume live detection.</div>
        </div>
        """, unsafe_allow_html=True)
        
        # Show Saved Worker History Gallery
        st.markdown("### 📸 Auto-Saved Worker Photos & Inspection History")
        if os.path.exists(SAVE_DIR):
            files = sorted([f for f in os.listdir(SAVE_DIR) if f.endswith(".jpg") or f.endswith(".png")], reverse=True)
            if files:
                cols = st.columns(4)
                for idx, img_file in enumerate(files[:8]):
                    img_path = os.path.join(SAVE_DIR, img_file)
                    with cols[idx % 4]:
                        st.image(img_path, use_container_width=True, caption=img_file)
                        if st.button("🗑️ Delete", key=f"del_off_{img_file}_{idx}"):
                            os.remove(img_path)
                            st.rerun()
            else:
                st.caption("No saved worker photos yet.")
        return

    # When Camera Power is ON:
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
            "Helmet / Hardhat", "DETECTED" if ppe_status["helmet"] else "WEAR HELMET! 🚨",
            "Head Protection Check", "🧢",
            "linear-gradient(135deg, #10b981 0%, #34d399 100%)" if ppe_status["helmet"] else "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
        ), unsafe_allow_html=True)

    with k4:
        st.markdown(render_glass_card(
            "High-Vis Vest", "DETECTED" if ppe_status["vest"] else "MISSING!",
            "Torso Protection Check", "🦺",
            "linear-gradient(135deg, #10b981 0%, #34d399 100%)" if ppe_status["vest"] else "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
        ), unsafe_allow_html=True)

    st.markdown("### 📡 Real-Time Live Detection & Surveillance Stream")
    if annotated_frame is not None:
        st.image(annotated_frame, channels="BGR", use_container_width=True, caption=f"Continuous Detection Stream (worker_{worker_id})")

    # Render Agentic AI Alert & Field Safety Directives Panel
    st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)
    st.markdown("### 🧠 Agentic AI Alert & Recommended Field Safety Directives")

    is_danger = not ppe_status["helmet"] or not ppe_status["vest"]
    agent_box_color = "rgba(239, 68, 68, 0.45)" if is_danger else "rgba(16, 185, 129, 0.45)"
    agent_title_color = "#ef4444" if is_danger else "#34d399"

    st.markdown(f"""
    <div style="background: rgba(30, 41, 59, 0.75); border: 1.5px solid {agent_box_color}; border-radius: 16px; padding: 22px; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-family: 'Outfit', sans-serif; font-size: 1.15rem; font-weight: 800; color: {agent_title_color};">
                {"🚨 AGENTIC AI HIGH VIOLATION ALERT: IMMEDIATE ACTION REQUIRED" if is_danger else "🟢 AGENTIC AI SAFETY ALERT: ACCESS PASSED & CLEAR"}
            </div>
            <div style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; padding: 4px 12px; font-size: 0.8rem; color: #38bdf8; font-weight: 700;">
                AGENTIC ACTION ROUTER ACTIVE
            </div>
        </div>
        <div style="margin: 12px 0 8px 0; color: #f8fafc; font-size: 1.05rem; font-weight: 600;">
            <strong>Autonomous Reasoning Summary:</strong> worker_{worker_id} scanned at CAM-01 Entry Gate. {"Hardhat is MISSING ('WEAR HELMET!')." if not ppe_status['helmet'] else "Hardhat is properly DETECTED."} {"High-Vis Vest is MISSING." if not ppe_status['vest'] else "High-Vis Vest is DETECTED."}
        </div>
        <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 14px 18px; margin-top: 10px; color: #38bdf8; font-weight: 600; font-size: 0.95rem;">
            🎯 <strong>Agentic AI Recommended Action:</strong> {"BLOCK Entry Gate barrier arm #1, sound audio alert siren, dispatch Safety Supervisor, enforce mandatory hardhat wearing before granting site entrance." if is_danger else "Grant site entrance, open Gate barrier arm #1, permit normal construction field activity."}
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Field Activity Safety Checklist & Directives
    st.markdown("#### 📋 Field Activity Safety & Compliance Directives")
    s1, s2, s3 = st.columns(3)
    with s1:
        st.checkbox("🪖 Hardhat Strap & Impact Liner Check", value=ppe_status["helmet"])
    with s2:
        st.checkbox("🦺 High-Vis Reflective Vest Check", value=ppe_status["vest"])
    with s3:
        st.checkbox("📜 OSHA 1926.100 Field Protocol Verified", value=result["decision"] == "PASS")

    if result["decision"] == "BLOCK":
        st.error(f"🚨 **ENTRY BLOCKED**: worker_{worker_id} missing {', '.join(result['missing_items'])}. Image and incident saved to SQLite database (`safety_events.db`).")
    else:
        st.success(f"✅ **ENTRY GRANTED**: worker_{worker_id} passed required hardhat and vest safety checks.")

    # Render Saved Worker History Gallery with Delete Buttons
    st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)
    
    hdr_col1, hdr_col2 = st.columns([3, 1])
    with hdr_col1:
        st.markdown("### 📸 Auto-Saved Worker Photos & Inspection History")
    with hdr_col2:
        if os.path.exists(SAVE_DIR) and len(os.listdir(SAVE_DIR)) > 0:
            if st.button("🗑️ Clear All Photos", type="secondary"):
                for f in os.listdir(SAVE_DIR):
                    if f.endswith(".jpg") or f.endswith(".png"):
                        os.remove(os.path.join(SAVE_DIR, f))
                st.session_state.worker_counter = 1
                st.success("Deleted all saved worker photos!")
                st.rerun()

    if os.path.exists(SAVE_DIR):
        files = sorted([f for f in os.listdir(SAVE_DIR) if f.endswith(".jpg") or f.endswith(".png")], reverse=True)
        if files:
            cols = st.columns(4)
            for idx, img_file in enumerate(files[:8]):
                img_path = os.path.join(SAVE_DIR, img_file)
                with cols[idx % 4]:
                    st.image(img_path, use_container_width=True, caption=img_file)
                    d_col1, d_col2 = st.columns([1, 1])
                    with d_col1:
                        with open(img_path, "rb") as file_bytes:
                            st.download_button(
                                label="📥 Save",
                                data=file_bytes,
                                file_name=img_file,
                                mime="image/jpeg",
                                key=f"dl_{img_file}_{idx}"
                            )
                    with d_col2:
                        if st.button("🗑️ Delete", key=f"del_{img_file}_{idx}"):
                            os.remove(img_path)
                            st.rerun()
        else:
            st.caption("No saved worker photos yet. Take a photo or run live camera detection to auto-save!")
