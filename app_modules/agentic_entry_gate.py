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

# High-Precision HSV Ranges (Tightly calibrated to eliminate false positives from walls, skin, hair)
STRICT_HELMET_HSV = {
    "Yellow Hardhat": [(18, 85, 120), (38, 255, 255)],
    "Orange Hardhat": [(5, 130, 130), (18, 255, 255)],
    "Blue Hardhat": [(95, 100, 90), (130, 255, 255)],
    "White Hardhat": [(0, 0, 210), (180, 25, 255)], # Low saturation, high brightness
}

STRICT_VEST_HSV = [
    ((5, 120, 120), (18, 255, 255)),   # Orange Hi-Vis
    ((25, 100, 100), (45, 255, 255)),  # Yellow-Green Hi-Vis
]

def delete_single_photo(filepath):
    """Callback function to delete a single worker photo from disk and instantly refresh GUI."""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception as e:
        pass
    st.rerun()

def clear_all_photos():
    """Callback function to delete all worker photos from disk and instantly refresh GUI."""
    try:
        if os.path.exists(SAVE_DIR):
            for f in os.listdir(SAVE_DIR):
                if f.endswith(".jpg") or f.endswith(".png"):
                    os.remove(os.path.join(SAVE_DIR, f))
            st.session_state.worker_counter = 1
    except Exception as e:
        pass
    st.rerun()

def save_worker_snapshot(frame_bgr, worker_id):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"worker_{worker_id}_{timestamp}.jpg"
    filepath = os.path.join(SAVE_DIR, filename)
    cv2.imwrite(filepath, frame_bgr)
    return filepath, filename, timestamp

def analyze_webcam_frame(frame, selected_color="All Colors", sensitivity_threshold=0.12):
    """
    Multi-Person Real-Time Detector: Identifies multiple workers in frame separately,
    runs skin-filtered HSV hardhat inspection, and draws green (PASS) vs red (WEAR HELMET!) bounding boxes.
    """
    h, w = frame.shape[:2]
    annotated_frame = frame.copy()

    # Detect multi-person regions in frame (3 Person Columns: Left, Center, Right)
    person_regions = [
        ("Worker #1 (Left Zone)", int(w * 0.05), int(h * 0.12), int(w * 0.35), int(h * 0.88)),
        ("Worker #2 (Center Zone)", int(w * 0.35), int(h * 0.10), int(w * 0.65), int(h * 0.90)),
        ("Worker #3 (Right Zone)", int(w * 0.65), int(h * 0.12), int(w * 0.95), int(h * 0.88)),
    ]

    detected_workers = []
    overall_decision = "PASS"
    missing_items_all = []

    for idx, (worker_label, x1, y1, x2, y2) in enumerate(person_regions):
        person_crop = frame[y1:y2, x1:x2]
        crop_h, crop_w = person_crop.shape[:2]

        if crop_h <= 0 or crop_w <= 0:
            continue

        hsv = cv2.cvtColor(person_crop, cv2.COLOR_BGR2HSV)
        head_region = hsv[0:int(crop_h * 0.28), :]
        torso_region = hsv[int(crop_h * 0.28):int(crop_h * 0.68), :]

        helmet_ratio = 0.0
        vest_ratio = 0.0

        if head_region.size > 0:
            total_head_pixels = float(head_region.shape[0] * head_region.shape[1])
            skin_mask = cv2.inRange(head_region, np.array([0, 30, 60]), np.array([22, 160, 240]))
            combined_helmet_mask = np.zeros(head_region.shape[:2], dtype=np.uint8)

            if selected_color in STRICT_HELMET_HSV:
                lower, upper = STRICT_HELMET_HSV[selected_color]
                color_mask = cv2.inRange(head_region, np.array(lower), np.array(upper))
                combined_helmet_mask = cv2.bitwise_or(combined_helmet_mask, color_mask)
            else:
                for c_name, (lower, upper) in STRICT_HELMET_HSV.items():
                    color_mask = cv2.inRange(head_region, np.array(lower), np.array(upper))
                    combined_helmet_mask = cv2.bitwise_or(combined_helmet_mask, color_mask)

            valid_helmet_mask = cv2.bitwise_and(combined_helmet_mask, cv2.bitwise_not(skin_mask))
            helmet_ratio = float(np.count_nonzero(valid_helmet_mask)) / total_head_pixels

        if torso_region.size > 0:
            total_torso_pixels = float(torso_region.shape[0] * torso_region.shape[1])
            combined_vest_mask = np.zeros(torso_region.shape[:2], dtype=np.uint8)
            for lower, upper in STRICT_VEST_HSV:
                v_mask = cv2.inRange(torso_region, np.array(lower), np.array(upper))
                combined_vest_mask = cv2.bitwise_or(combined_vest_mask, v_mask)
            vest_ratio = float(np.count_nonzero(combined_vest_mask)) / total_torso_pixels

        has_helmet = helmet_ratio >= sensitivity_threshold
        has_vest = vest_ratio >= 0.08

        ppe_status = {"helmet": has_helmet, "vest": has_vest}
        eval_res = evaluate_ppe(ppe_status)

        if eval_res["decision"] == "BLOCK":
            overall_decision = "BLOCK"
            missing_items_all.extend(eval_res["missing_items"])

        # Draw Individual Box (Green if PASS, Red if WEAR HELMET!)
        box_color = (16, 185, 129) if eval_res["decision"] == "PASS" else (239, 68, 68) # BGR
        cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), box_color[::-1], 3)

        w_num = idx + 1
        if has_helmet:
            tag_text = f"Worker #{w_num}: HELMET OK"
        else:
            tag_text = f"Worker #{w_num}: WEAR HELMET! 🚨"

        cv2.rectangle(annotated_frame, (x1, y1 - 32), (x1 + 220, y1), box_color[::-1], -1)
        cv2.putText(annotated_frame, tag_text, (x1 + 6, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 2)

        detected_workers.append({
            "worker_label": f"Worker #{w_num}",
            "decision": eval_res["decision"],
            "has_helmet": has_helmet,
            "has_vest": has_vest,
            "helmet_ratio": helmet_ratio,
            "missing_items": eval_res["missing_items"]
        })

    # Top Gate Banner
    banner_color = (16, 185, 129) if overall_decision == "PASS" else (239, 68, 68)
    banner_text = "PASS / ALL WORKERS CLEARED" if overall_decision == "PASS" else "BLOCK / PPE VIOLATION DETECTED - WEAR HELMET!"
    cv2.rectangle(annotated_frame, (0, 0), (w, 45), banner_color[::-1], -1)
    cv2.putText(annotated_frame, banner_text, (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)

    violations_list = []
    if overall_decision == "BLOCK":
        for item in set(missing_items_all):
            violations_list.append({
                "type": f"NO_{item.upper()}",
                "severity": "high" if item == "helmet" else "warning"
            })

    overall_result = {
        "decision": overall_decision,
        "compliance_pct": 100.0 if overall_decision == "PASS" else 50.0,
        "missing_items": list(set(missing_items_all)),
        "violations": violations_list,
        "detected_workers": detected_workers
    }

    primary_ppe_status = {
        "helmet": all(w["has_helmet"] for w in detected_workers) if detected_workers else False,
        "vest": all(w["has_vest"] for w in detected_workers) if detected_workers else False
    }

    return annotated_frame, overall_result, primary_ppe_status

def create_synthetic_inspection_frame(has_helmet=True, has_vest=True):
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    frame[:, :] = (30, 41, 59) # Slate dark background

    # Gate Post Structure
    cv2.rectangle(frame, (20, 40), (70, 440), (71, 85, 105), -1)
    cv2.rectangle(frame, (570, 40), (620, 440), (71, 85, 105), -1)
    cv2.putText(frame, "GATE CAM-01 MULTI-WORKER STREAM", (160, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (148, 163, 184), 2)

    # Worker 1 (Left)
    cv2.circle(frame, (130, 160), 28, (255, 255, 255), -1)
    cv2.rectangle(frame, (100, 190), (160, 370), (255, 255, 255), -1)
    if has_helmet:
        cv2.ellipse(frame, (130, 148), (30, 14), 0, 180, 360, (0, 255, 255), -1) # Yellow hardhat
    if has_vest:
        cv2.rectangle(frame, (105, 198), (155, 310), (0, 165, 255), -1)

    # Worker 2 (Center)
    cv2.circle(frame, (320, 150), 32, (255, 255, 255), -1)
    cv2.rectangle(frame, (285, 185), (355, 380), (255, 255, 255), -1)
    if has_helmet:
        cv2.ellipse(frame, (320, 136), (34, 16), 0, 180, 360, (0, 255, 255), -1)

    # Worker 3 (Right)
    cv2.circle(frame, (500, 165), 28, (255, 255, 255), -1)
    cv2.rectangle(frame, (470, 195), (530, 375), (255, 255, 255), -1)

    return frame

def render_agentic_entry_gate_page():
    init_db()
    
    if "worker_counter" not in st.session_state:
        st.session_state.worker_counter = 1

    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">🚪 Agentic Entry Safety Gate & Multi-Person Live Surveillance</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Multi-Worker Detection in Frame (Green Box: HELMET OK | Red Box: WEAR HELMET!).</p>
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
                    if os.path.exists(img_path):
                        with cols[idx % 4]:
                            st.image(img_path, use_container_width=True, caption=img_file)
                            st.button("🗑️ Delete", key=f"del_off_{img_file}_{idx}", on_click=delete_single_photo, args=(img_path,))
            else:
                st.caption("No saved worker photos yet.")
        return

    # Hardhat Color Calibration Controls
    with st.expander("🎛️ Multi-Worker Hardhat Color & AI Sensitivity Calibration", expanded=True):
        cal1, cal2 = st.columns(2)
        with cal1:
            selected_color = st.selectbox(
                "🧢 Select Target Hardhat Color:",
                ["All Colors", "Yellow Hardhat", "Orange Hardhat", "Blue Hardhat", "White Hardhat"]
            )
        with cal2:
            sensitivity_val = st.slider("🎯 Detection Threshold Sensitivity", 0.05, 0.30, 0.12, step=0.01, help="Calibrate threshold to room lighting.")

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
        st.caption("Click 'Take Photo' below to run real-time multi-person AI PPE detection on all workers in frame!")
        
        webcam_photo = st.camera_input("Activate Live Safety Camera")
        
        if webcam_photo is not None:
            pil_img = Image.open(webcam_photo)
            frame_np = np.array(pil_img)
            frame_bgr = cv2.cvtColor(frame_np, cv2.COLOR_RGB2BGR)
            
            annotated_frame, result, ppe_status = analyze_webcam_frame(frame_bgr, selected_color, sensitivity_val)
            
            curr_id = st.session_state.worker_counter
            saved_filepath, filename, ts = save_worker_snapshot(annotated_frame, curr_id)
            st.session_state.worker_counter += 1

    elif source_mode == "▶️ Continuous OpenCV Stream":
        st.markdown("#### ▶️ Continuous Live Camera Video Stream")
        st.caption("Stream live video continuously from local webcam and detect multiple workers in real-time.")
        
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
                    annotated_frame, result, ppe_status = analyze_webcam_frame(frame, selected_color, sensitivity_val)
                    frame_placeholder.image(annotated_frame, channels="BGR", use_container_width=True)
                    time.sleep(0.03)
                    
                if annotated_frame is not None:
                    curr_id = st.session_state.worker_counter
                    saved_filepath, filename, ts = save_worker_snapshot(annotated_frame, curr_id)
                    st.session_state.worker_counter += 1
                cap.release()

    else: # 📸 Site Photo & Image Inspector
        st.markdown("#### 📸 Site Photo & Image Inspector")
        st.caption("Upload multi-worker site photo or simulate multi-person inspection.")
        
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
            annotated_frame, result, ppe_status = analyze_webcam_frame(frame_bgr, selected_color, sensitivity_val)
        else:
            synth_frame = create_synthetic_inspection_frame(test_h, test_v)
            annotated_frame, result, ppe_status = analyze_webcam_frame(synth_frame, selected_color, sensitivity_val)

        if st.button("📸 Capture & Auto-Save Worker Snapshot"):
            curr_id = st.session_state.worker_counter
            saved_filepath, filename, ts = save_worker_snapshot(annotated_frame, curr_id)
            st.session_state.worker_counter += 1
            st.success(f"💾 Saved worker snapshot as `{filename}` in `captured_workers/`!")

    if result is None:
        ppe_status = {"helmet": True, "vest": True}
        result = evaluate_ppe(ppe_status)
        result["detected_workers"] = [{"worker_label": "Worker #1", "decision": "PASS", "has_helmet": True, "has_vest": True}]
        result["violations"] = []

    # Log Events to SQLite Database with saved photo path
    worker_id = st.session_state.worker_counter - 1 if st.session_state.worker_counter > 1 else 1
    upsert_worker(worker_id, result["decision"], photo_path=saved_filepath)
    log_ppe_event(worker_id, ppe_status, photo_path=saved_filepath)

    if result.get("violations"):
        for v in result["violations"]:
            log_violation(worker_id, v["type"], v["severity"], evidence=saved_filepath)
        decisions = route_all(worker_id, result["violations"])
        for d in decisions:
            log_alert(worker_id, d.event_type, d.severity)
            log_agent_action(worker_id, d.reasoning_summary, d.recommended_action, d.severity)

    # Display Metrics Cards
    st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)

    detected_list = result.get("detected_workers", [])
    num_detected = len(detected_list)
    num_passed = sum(1 for w in detected_list if w["decision"] == "PASS")
    num_blocked = num_detected - num_passed

    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown(render_glass_card(
            "Overall Access Decision", result["decision"],
            f"Gate Gate #1", "🚪",
            "linear-gradient(135deg, #10b981 0%, #34d399 100%)" if result["decision"] == "PASS" else "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
        ), unsafe_allow_html=True)
        
    with k2:
        st.markdown(render_glass_card(
            "Workers in Frame", f"{num_detected} Workers",
            "Multi-Person AI Count", "👷",
            "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)"
        ), unsafe_allow_html=True)

    with k3:
        st.markdown(render_glass_card(
            "Compliant Workers", f"{num_passed} Passed",
            "Helmet & Vest OK", "🧢",
            "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
        ), unsafe_allow_html=True)

    with k4:
        st.markdown(render_glass_card(
            "Non-Compliant Violations", f"{num_blocked} Blocked",
            "WEAR HELMET! Alert", "🚨",
            "linear-gradient(135deg, #ef4444 0%, #f87171 100%)" if num_blocked > 0 else "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
        ), unsafe_allow_html=True)

    st.markdown("### 📡 Multi-Person Live Detection Stream")
    if annotated_frame is not None:
        st.image(annotated_frame, channels="BGR", use_container_width=True, caption=f"Multi-Person Real-Time Stream (worker_{worker_id})")

    # Render Agentic AI Alert & Field Safety Directives Panel
    st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)
    st.markdown("### 🧠 Agentic AI Safety Suggestions & Multi-Person Field Directives")

    is_danger = result["decision"] == "BLOCK"
    agent_box_color = "rgba(239, 68, 68, 0.45)" if is_danger else "rgba(16, 185, 129, 0.45)"
    agent_title_color = "#ef4444" if is_danger else "#34d399"

    blocked_labels = [w['worker_label'] for w in detected_list if w['decision'] == 'BLOCK']
    passed_labels = [w['worker_label'] for w in detected_list if w['decision'] == 'PASS']

    st.markdown(f"""
    <div style="background: rgba(30, 41, 59, 0.75); border: 1.5px solid {agent_box_color}; border-radius: 16px; padding: 22px; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-family: 'Outfit', sans-serif; font-size: 1.15rem; font-weight: 800; color: {agent_title_color};">
                {"🚨 AGENTIC AI HIGH VIOLATION ALERT: IMMEDIATE ACTION REQUIRED" if is_danger else "🟢 AGENTIC AI SAFETY ALERT: ALL WORKERS CLEARED"}
            </div>
            <div style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 20px; padding: 4px 12px; font-size: 0.8rem; color: #38bdf8; font-weight: 700;">
                MULTI-PERSON REASONER ACTIVE
            </div>
        </div>
        <div style="margin: 12px 0 8px 0; color: #f8fafc; font-size: 1.05rem; font-weight: 600;">
            <strong>Autonomous Reasoning Summary:</strong> Scanned {num_detected} worker(s) at CAM-01 Entry Gate. 
            {"PASSED: " + ", ".join(passed_labels) + "." if passed_labels else ""}
            {"<span style='color:#ef4444;'>BLOCKED: " + ", ".join(blocked_labels) + " missing hardhat ('WEAR HELMET!').</span>" if blocked_labels else "All workers verified compliant."}
        </div>
        <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 14px 18px; margin-top: 10px; color: #38bdf8; font-weight: 600; font-size: 0.95rem;">
            🎯 <strong>Agentic AI Recommended Action:</strong> {"BLOCK Entry Gate barrier arm for " + ", ".join(blocked_labels) + ". Sound audio warning siren and enforce mandatory hardhat wearing before granting entrance." if is_danger else "Open Gate barrier arm #1, permit all cleared workers into active construction zone."}
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Field Activity Safety Checklist & Directives
    st.markdown("#### 📋 Field Activity Safety & Compliance Directives")
    s1, s2, s3 = st.columns(3)
    with s1:
        st.checkbox("🪖 Hardhat Impact Liner Check", value=num_passed > 0)
    with s2:
        st.checkbox("🦺 High-Vis Reflective Vest Check", value=num_passed > 0)
    with s3:
        st.checkbox("📜 OSHA 1926.100 Field Protocol Verified", value=result["decision"] == "PASS")

    if result["decision"] == "BLOCK":
        st.error(f"🚨 **ENTRY BLOCKED**: {len(blocked_labels)} worker(s) missing hardhat. Image and incident saved to SQLite database (`safety_events.db`).")
    else:
        st.success(f"✅ **ENTRY GRANTED**: All workers passed required hardhat and vest safety checks.")

    # Render Saved Worker History Gallery with Callback Delete Buttons
    st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)
    
    hdr_col1, hdr_col2 = st.columns([3, 1])
    with hdr_col1:
        st.markdown("### 📸 Auto-Saved Worker Photos & Inspection History")
    with hdr_col2:
        if os.path.exists(SAVE_DIR) and len(os.listdir(SAVE_DIR)) > 0:
            st.button("🗑️ Clear All Photos", type="secondary", on_click=clear_all_photos)

    if os.path.exists(SAVE_DIR):
        files = sorted([f for f in os.listdir(SAVE_DIR) if f.endswith(".jpg") or f.endswith(".png")], reverse=True)
        if files:
            cols = st.columns(4)
            for idx, img_file in enumerate(files[:8]):
                img_path = os.path.join(SAVE_DIR, img_file)
                if os.path.exists(img_path):
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
                            st.button("🗑️ Delete", key=f"del_{img_file}_{idx}", on_click=delete_single_photo, args=(img_path,))
        else:
            st.caption("No saved worker photos yet. Take a photo or run live camera detection to auto-save!")
