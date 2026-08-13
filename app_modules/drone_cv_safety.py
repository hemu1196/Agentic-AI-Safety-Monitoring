import streamlit as st
import cv2
import numpy as np
import pandas as pd
from PIL import Image, ImageDraw, ImageFont
import plotly.express as px
import plotly.graph_objects as go
from utils import render_glass_card, apply_plotly_theme

def generate_drone_surveillance_feed(num_workers=8, unsafe_ratio=0.25):
    """
    Generates a realistic Computer Vision Aerial Drone Feed with
    bounding boxes, PPE helmet detection (Safe vs Unsafe), and Drone HUD overlay.
    """
    width, height = 800, 480
    
    # Create background image simulating construction ground from drone view
    img = np.zeros((height, width, 3), dtype=np.uint8)
    img[:, :] = (30, 41, 59) # Slate dark blue ground
    
    # Draw grid lines to simulate site foundation
    for x in range(0, width, 80):
        cv2.line(img, (x, 0), (x, height), (51, 65, 85), 1)
    for y in range(0, height, 60):
        cv2.line(img, (0, y), (width, y), (51, 65, 85), 1)
        
    # Draw building structure outline from aerial view
    cv2.rectangle(img, (150, 80), (650, 400), (71, 85, 105), 3)
    cv2.rectangle(img, (170, 100), (630, 380), (100, 116, 139), 2)
    cv2.putText(img, "ZONE A - TOWER CRANE FOOTPRINT", (180, 125), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (148, 163, 184), 1)

    # Worker coordinates & PPE safety classification
    np.random.seed(101)
    workers_data = []
    
    num_unsafe = int(round(num_workers * unsafe_ratio))
    safety_status = [False] * num_unsafe + [True] * (num_workers - num_unsafe)
    np.random.shuffle(safety_status)

    for i in range(num_workers):
        wx = np.random.randint(180, 600)
        wy = np.random.randint(130, 360)
        has_helmet = safety_status[i]
        
        # Color: Green if Helmet Detected, Red if Missing
        color = (16, 185, 129) if has_helmet else (239, 68, 68) # BGR
        label = f"Worker #{i+1}: HELMET OK" if has_helmet else f"Worker #{i+1}: NO HELMET!"

        # Draw Worker Bounding Box
        box_w, box_h = 45, 65
        top_left = (wx - box_w // 2, wy - box_h // 2)
        bottom_right = (wx + box_w // 2, wy + box_h // 2)
        
        cv2.rectangle(img, top_left, bottom_right, color[::-1], 2) # RGB to BGR
        
        # Helmet circle indicator above head
        helmet_y = wy - box_h // 2 - 8
        if has_helmet:
            cv2.circle(img, (wx, helmet_y), 6, (16, 185, 129)[::-1], -1) # Green hardhat
        else:
            cv2.circle(img, (wx, helmet_y), 6, (239, 68, 68)[::-1], -1) # Red warning circle
            cv2.putText(img, "!", (wx - 3, helmet_y + 4), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

        # Label background pill
        cv2.rectangle(img, (wx - box_w // 2, wy - box_h // 2 - 24), (wx + box_w // 2 + 35, wy - box_h // 2 - 4), color[::-1], -1)
        cv2.putText(img, label, (wx - box_w // 2 + 4, wy - box_h // 2 - 9), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (255, 255, 255), 1)

        workers_data.append({
            "Worker_ID": f"Worker #{i+1}",
            "Position_X": wx,
            "Position_Y": wy,
            "Helmet_Status": "SAFE (Helmet Detected)" if has_helmet else "UNSAFE (No Helmet!)",
            "Confidence": f"{np.random.uniform(91.5, 98.9):.1f}%"
        })

    # Draw Aerial Drone HUD Overlay
    # Reticle / Crosshair
    cx, cy = width // 2, height // 2
    cv2.circle(img, (cx, cy), 35, (56, 189, 248), 1)
    cv2.line(img, (cx - 45, cy), (cx - 15, cy), (56, 189, 248), 1)
    cv2.line(img, (cx + 15, cy), (cx + 45, cy), (56, 189, 248), 1)
    cv2.line(img, (cx, cy - 45), (cx, cy - 15), (56, 189, 248), 1)
    cv2.line(img, (cx, cy + 15), (cx, cy + 45), (56, 189, 248), 1)

    # Top HUD Bar
    cv2.rectangle(img, (0, 0), (width, 35), (15, 23, 42), -1)
    cv2.putText(img, "DRONE-01 AI SURVEILLANCE FEED", (20, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (56, 189, 248), 1)
    cv2.putText(img, "ALT: 42.5m | BAT: 94% | GPS: 37.7749N, -122.4194W", (320, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (148, 163, 184), 1)
    cv2.circle(img, (760, 18), 5, (239, 68, 68), -1)
    cv2.putText(img, "REC", (720, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (239, 68, 68), 1)

    # Bottom HUD Status
    cv2.rectangle(img, (0, height - 35), (width, height), (15, 23, 42), -1)
    cv2.putText(img, f"AI TARGET COUNTS: {num_workers} WORKERS DETECTED | {num_unsafe} UNSAFE (NO HELMET)", (20, height - 12), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (248, 250, 252), 1)

    return img, workers_data, num_unsafe

def render_drone_cv_safety_page(df):
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">🚁 Computer Vision (CV) PPE Helmet & Drone Safety Command</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Real-time AI Object Detection for Worker Helmets (Hardhats), PPE Compliance & Aerial Drone Surveillance Feed.</p>
    </div>
    """, unsafe_allow_html=True)

    # Interactive Drone & CV Control Panel
    with st.expander("🎛️ AI Computer Vision & Drone Flight Controls", expanded=True):
        c1, c2, c3 = st.columns(3)
        with c1:
            num_workers = st.slider("Simulated Workers on Site", 4, 20, 10, key="cv_workers")
        with c2:
            unsafe_ratio = st.slider("Non-Compliant PPE Ratio", 0.0, 0.8, 0.20, step=0.05, key="cv_unsafe")
        with c3:
            conf_thresh = st.slider("AI Detection Confidence Threshold", 0.50, 0.99, 0.85, step=0.05, key="cv_conf")

    # Generate Drone AI Frame
    frame, workers_data, num_unsafe = generate_drone_surveillance_feed(num_workers, unsafe_ratio)
    
    # Calculate PPE Compliance %
    safe_count = num_workers - num_unsafe
    compliance_pct = (safe_count / num_workers) * 100.0 if num_workers > 0 else 100.0

    st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)

    # Key Metrics Cards
    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.markdown(render_glass_card(
            "Detected Workers", f"{num_workers}",
            "AI Bounding Boxes", "👷",
            "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)"
        ), unsafe_allow_html=True)
    with m2:
        st.markdown(render_glass_card(
            "PPE Helmet Compliance", f"{compliance_pct:.1f}%",
            f"{safe_count} Safe / {num_workers} Total", "🪖",
            "linear-gradient(135deg, #10b981 0%, #34d399 100%)" if compliance_pct >= 80 else "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
        ), unsafe_allow_html=True)
    with m3:
        st.markdown(render_glass_card(
            "Unsafe Workers (No Helmet)", f"{num_unsafe}",
            "High Hazard Risk", "🚨",
            "linear-gradient(135deg, #ef4444 0%, #f87171 100%)" if num_unsafe > 0 else "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
        ), unsafe_allow_html=True)
    with m4:
        st.markdown(render_glass_card(
            "Drone AI Feed Status", "ACTIVE STREAM",
            "Resolution: 800x480 @ 30 FPS", "📡",
            "linear-gradient(135deg, #c084fc 0%, #e879f9 100%)"
        ), unsafe_allow_html=True)

    st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)
    st.markdown("### 📡 Live AI Computer Vision & Aerial Drone Feed")

    col_feed, col_audit = st.columns([7, 5])

    with col_feed:
        # Display OpenCV CV annotated frame
        st.image(frame, channels="BGR", use_container_width=True, caption="Live Computer Vision Stream (Green Box = Helmet OK | Red Box = No Helmet!)")
        
        if num_unsafe > 0:
            st.error(f"🚨 **SAFETY VIOLATION ALERT**: {num_unsafe} worker(s) detected without safety helmets! Dispatch site safety officer to Zone A.")
        else:
            st.success("✅ **ALL WORKERS SAFE**: 100% PPE Hardhat compliance detected across site.")

    with col_audit:
        st.markdown("#### 📋 AI Bounding Box Inspection Log")
        workers_df = pd.DataFrame(workers_data)
        st.dataframe(workers_df, use_container_width=True, height=360)

        # Download CV Audit Log
        csv_log = workers_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Drone Safety Audit Log (CSV)",
            data=csv_log,
            file_name="Drone_PPE_Helmet_Safety_Audit.csv",
            mime="text/csv",
            type="primary",
            use_container_width=True
        )
