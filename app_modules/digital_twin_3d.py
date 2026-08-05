import streamlit as st
import plotly.graph_objects as go
import numpy as np
from utils import apply_plotly_theme, get_risk_level_info, predict_single_sample

def render_3d_digital_twin_page(df, bundle):
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">🌐 3D Interactive Construction Digital Twin</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Interactive 3D Visualization of Site Structures, Tower Crane, Machinery Zones, and Dynamic Risk Aura.</p>
    </div>
    """, unsafe_allow_html=True)

    if df is None or bundle is None:
        st.warning("Dataset or model bundle unavailable.")
        return

    # Interactive Telemetry Controls
    with st.expander("🎛️ 3D Telemetry & Visual Aura Controls", expanded=True):
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            temp_input = st.slider("Site Temp (°C)", 10.0, 50.0, 34.0, key="dt_temp")
        with c2:
            vib_input = st.slider("Vibration Level", 0.0, 100.0, 55.0, key="dt_vib")
        with c3:
            shortage_input = st.selectbox("Shortage Alert", [0, 1], index=0, format_func=lambda x: "Normal (0)" if x == 0 else "Shortage Alert (1)", key="dt_shortage")
        with c4:
            worker_input = st.slider("Active Workers", 1, 40, 16, key="dt_workers")

    # Predict Risk Score for Dynamic 3D Risk Aura
    telemetry_3d = {
        "timestamp": "2026-08-05 12:00:00",
        "temperature": temp_input,
        "humidity": 65.0,
        "vibration_level": vib_input,
        "material_usage": 180.0,
        "machinery_status": 1,
        "worker_count": worker_input,
        "energy_consumption": 410.0,
        "task_progress": 0.55,
        "cost_deviation": 1200.0,
        "time_deviation": 2.0,
        "safety_incidents": 1 if vib_input > 60 else 0,
        "equipment_utilization_rate": 80.0,
        "material_shortage_alert": shortage_input,
        "simulation_deviation": 0.5,
        "update_frequency": 10,
        "optimization_suggestion": "Optimize Material Usage",
        "performance_score": "Excellent"
    }

    risk_score, _ = predict_single_sample(telemetry_3d, bundle)
    clean_score = max(0.0, min(100.0, float(risk_score))) if risk_score else 45.0
    risk_info = get_risk_level_info(clean_score)

    st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)

    # Render 3D Model with High-Contrast Plotly 3D Lines & Spheres (Universal Compatibility)
    fig = go.Figure()

    # 1. 3D Ground Wireframe Grid (Guaranteed rendering in all browsers)
    grid_x, grid_y, grid_z = [], [], []
    for step in range(-30, 35, 5):
        grid_x.extend([-30, 30, None, step, step, None])
        grid_y.extend([step, step, None, -30, 30, None])
        grid_z.extend([0, 0, None, 0, 0, None])

    fig.add_trace(go.Scatter3d(
        x=grid_x, y=grid_y, z=grid_z,
        mode='lines',
        line=dict(color='rgba(255, 255, 255, 0.15)', width=2),
        name='Ground Surface Grid'
    ))

    # 2. Multi-Story Building Framework (Slabs & Columns)
    floors = [8, 18, 28, 38]
    for idx, f_height in enumerate(floors):
        fig.add_trace(go.Scatter3d(
            x=[0, 20, 20, 0, 0],
            y=[0, 0, 20, 20, 0],
            z=[f_height, f_height, f_height, f_height, f_height],
            mode='lines',
            line=dict(color='#38bdf8', width=6),
            name=f'Building Floor {idx+1}'
        ))

    # 3D Steel Pillars
    for px, py in [(0, 0), (20, 0), (20, 20), (0, 20)]:
        fig.add_trace(go.Scatter3d(
            x=[px, px], y=[py, py], z=[0, 38],
            mode='lines',
            line=dict(color='#64748b', width=7),
            showlegend=False
        ))

    # 3. 3D Tower Crane Structure (Yellow / Amber)
    # Vertical Mast
    fig.add_trace(go.Scatter3d(
        x=[-15, -15], y=[-15, -15], z=[0, 52],
        mode='lines+markers',
        line=dict(color='#f59e0b', width=10),
        marker=dict(size=4, color='#fbbf24'),
        name='3D Tower Crane Mast'
    ))
    # Horizontal Jib & Counterweight
    fig.add_trace(go.Scatter3d(
        x=[-28, 25], y=[-15, -15], z=[52, 52],
        mode='lines',
        line=dict(color='#fbbf24', width=8),
        name='Crane Jib'
    ))
    # Hoist Cable & Suspended Cargo Box
    fig.add_trace(go.Scatter3d(
        x=[12, 12, 12],
        y=[-15, -15, -15],
        z=[52, 20, 20],
        mode='lines+markers',
        line=dict(color='#e2e8f0', width=4),
        marker=dict(size=[0, 0, 14], color=['#e2e8f0', '#e2e8f0', '#38bdf8'], symbol=['circle', 'circle', 'square']),
        name='Crane Hoist & Cargo'
    ))

    # 4. Heavy Equipment / Machinery Zone Box
    fig.add_trace(go.Scatter3d(
        x=[-12, -4, -4, -12, -12],
        y=[8, 8, 16, 16, 8],
        z=[0, 0, 0, 0, 0],
        mode='lines',
        line=dict(color='#ef4444' if shortage_input == 1 else '#10b981', width=6),
        name='Machinery Zone'
    ))

    # 5. Worker Positions (3D Spheres)
    np.random.seed(42)
    wx = np.random.uniform(2, 18, worker_input)
    wy = np.random.uniform(2, 18, worker_input)
    wz = np.random.choice([0, 8, 18, 28], worker_input)
    fig.add_trace(go.Scatter3d(
        x=wx, y=wy, z=wz,
        mode='markers',
        marker=dict(size=6, color='#38bdf8', symbol='circle'),
        name=f'Workers ({worker_input} On-Site)'
    ))

    # 6. Dynamic Risk Score 3D Aura Sphere
    fig.add_trace(go.Scatter3d(
        x=[10], y=[10], z=[18],
        mode='markers',
        marker=dict(
            size=min(65, max(22, clean_score * 0.75)),
            color=risk_info['color'],
            opacity=0.6,
            symbol='circle'
        ),
        name=f'Site Risk Aura ({clean_score:.1f})'
    ))

    apply_plotly_theme(fig, height=600, title=f"3D Digital Twin Model — Site Risk Level: {risk_info['level']} ({clean_score:.1f})")
    
    fig.update_layout(
        scene=dict(
            xaxis=dict(title='X (Meters)', range=[-35, 35], gridcolor='rgba(255,255,255,0.12)', backgroundcolor='#0b0f19'),
            yaxis=dict(title='Y (Meters)', range=[-35, 35], gridcolor='rgba(255,255,255,0.12)', backgroundcolor='#0b0f19'),
            zaxis=dict(title='Elevation Z (Meters)', range=[0, 60], gridcolor='rgba(255,255,255,0.12)', backgroundcolor='#0b0f19'),
            camera=dict(
                eye=dict(x=1.6, y=-1.6, z=1.3)
            )
        ),
        margin=dict(l=10, r=10, t=50, b=10)
    )

    st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': True, 'responsive': True})

    # Status Cards
    s1, s2, s3 = st.columns(3)
    with s1:
        st.markdown(f"**Predicted 3D Risk Score**: <span style='color:{risk_info['color']}; font-weight:bold; font-size:1.3rem;'>{clean_score:.1f} / 100</span>", unsafe_allow_html=True)
    with s2:
        st.markdown(f"**Site Risk Category**: <span style='color:{risk_info['color']}; font-weight:bold; font-size:1.3rem;'>{risk_info['level']}</span>", unsafe_allow_html=True)
    with s3:
        st.markdown(f"**Warning Beacon**: <span style='color:#38bdf8; font-weight:bold;'>{'🚨 HIGH RISK FLASHING SIREN' if clean_score > 75 else '🟢 SAFE OPERATION'}</span>", unsafe_allow_html=True)
