import streamlit as st
import plotly.graph_objects as go
import numpy as np
from utils import apply_plotly_theme, get_risk_level_info, predict_single_sample

def render_3d_digital_twin_page(df, bundle):
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">🌐 3D Interactive Construction Digital Twin</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Real-time 3D WebGL Visualization of Site Structures, Machinery, Sensors, and Dynamic Risk Spheres.</p>
    </div>
    """, unsafe_allow_html=True)

    if df is None or bundle is None:
        st.warning("Dataset or model bundle unavailable.")
        return

    # Telemetry Control Panel for 3D Scene
    with st.expander("🎛️ 3D Site Controls & Live Telemetry", expanded=True):
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            temp_input = st.slider("Site Temp (°C)", 10.0, 50.0, 32.0, key="3d_temp")
        with c2:
            vib_input = st.slider("Vibration Level", 0.0, 100.0, 45.0, key="3d_vib")
        with c3:
            shortage_input = st.selectbox("Material Shortage", [0, 1], index=0, format_func=lambda x: "Normal (0)" if x == 0 else "Shortage Alert (1)", key="3d_shortage")
        with c4:
            worker_input = st.slider("Active Workers", 1, 40, 15, key="3d_workers")

    # Predict Risk for 3D Visual Aura
    telemetry_3d = {
        "timestamp": "2026-08-04 12:00:00",
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

    # Render 3D Model using Plotly 3D Graph Objects
    fig = go.Figure()

    # 1. Ground Plane (Site Surface)
    grid_size = 60
    gx, gy = np.meshgrid(np.linspace(-30, 30, 20), np.linspace(-30, 30, 20))
    gz = np.zeros_like(gx)
    fig.add_trace(go.Surface(
        x=gx, y=gy, z=gz,
        colorscale=[[0, '#0f172a'], [1, '#1e293b']],
        showscale=False,
        opacity=0.85,
        name='Construction Ground'
    ))

    # 2. Multi-Story Building Structure (Slabs & Columns)
    floors = [5, 15, 25, 35]
    for idx, f_height in enumerate(floors):
        # Floor Slab
        bx = [5, 25, 25, 5, 5]
        by = [5, 5, 25, 25, 5]
        bz = [f_height] * 5
        fig.add_trace(go.Scatter3d(
            x=bx, y=by, z=bz,
            mode='lines',
            line=dict(color='#38bdf8', width=6),
            name=f'Building Slab {idx+1}'
        ))
        
    # Support Pillars (Columns)
    for px, py in [(5, 5), (25, 5), (25, 25), (5, 25)]:
        fig.add_trace(go.Scatter3d(
            x=[px, px], y=[py, py], z=[0, 35],
            mode='lines',
            line=dict(color='#64748b', width=8),
            showlegend=False
        ))

    # 3. 3D Tower Crane Structure
    # Crane Mast
    fig.add_trace(go.Scatter3d(
        x=[-15, -15], y=[-15, -15], z=[0, 50],
        mode='lines',
        line=dict(color='#f59e0b', width=10),
        name='Tower Crane Mast'
    ))
    # Crane Jib & Counterweight
    fig.add_trace(go.Scatter3d(
        x=[-30, 20], y=[-15, -15], z=[50, 50],
        mode='lines',
        line=dict(color='#fbbf24', width=8),
        name='Crane Jib'
    ))
    # Crane Hoist Line & Hook
    fig.add_trace(go.Scatter3d(
        x=[10, 10], y=[-15, -15], z=[50, 20],
        mode='lines',
        line=dict(color='#94a3b8', width=3),
        name='Hoist Cable'
    ))

    # 4. Excavator / Machinery Zone
    fig.add_trace(go.Scatter3d(
        x=[-10, -5, -5, -10, -10],
        y=[10, 10, 18, 18, 10],
        z=[0, 0, 0, 0, 0],
        mode='lines',
        line=dict(color='#10b981' if shortage_input == 0 else '#ef4444', width=6),
        name='Machinery Zone'
    ))

    # 5. Worker Points (Scatter Markers)
    np.random.seed(42)
    wx = np.random.uniform(2, 28, worker_input)
    wy = np.random.uniform(2, 28, worker_input)
    wz = np.random.choice([0, 5, 15, 25], worker_input)
    fig.add_trace(go.Scatter3d(
        x=wx, y=wy, z=wz,
        mode='markers',
        marker=dict(size=6, color='#38bdf8', symbol='circle'),
        name=f'Active Workers ({worker_input})'
    ))

    # 6. Dynamic Risk Score 3D Aura Sphere
    fig.add_trace(go.Scatter3d(
        x=[15], y=[15], z=[20],
        mode='markers',
        marker=dict(
            size=min(60, max(20, clean_score * 0.8)),
            color=risk_info['color'],
            opacity=0.45,
            symbol='circle'
        ),
        name=f'Site Risk Aura ({clean_score:.1f})'
    ))

    apply_plotly_theme(fig, height=620, title=f"3D Digital Twin — Site Risk Level: {risk_info['level']} ({clean_score:.1f})")
    
    fig.update_layout(
        scene=dict(
            xaxis=dict(title='X Axis (Meters)', gridcolor='rgba(255,255,255,0.1)', backgroundcolor='#0f172a'),
            yaxis=dict(title='Y Axis (Meters)', gridcolor='rgba(255,255,255,0.1)', backgroundcolor='#0f172a'),
            zaxis=dict(title='Elevation Z (Meters)', gridcolor='rgba(255,255,255,0.1)', backgroundcolor='#0f172a'),
            camera=dict(
                eye=dict(x=1.5, y=-1.5, z=1.2)
            )
        ),
        margin=dict(l=10, r=10, t=50, b=10)
    )

    st.plotly_chart(fig, use_container_width=True)

    # Site Status Summary Box
    s1, s2, s3 = st.columns(3)
    with s1:
        st.markdown(f"**Predicted 3D Risk Score**: <span style='color:{risk_info['color']}; font-weight:bold; font-size:1.3rem;'>{clean_score:.1f}</span>", unsafe_allow_html=True)
    with s2:
        st.markdown(f"**Site Status**: <span style='color:{risk_info['color']}; font-weight:bold; font-size:1.3rem;'>{risk_info['level']}</span>", unsafe_allow_html=True)
    with s3:
        st.markdown(f"**Visual Status**: <span style='color:#38bdf8; font-weight:bold;'>{'🚨 High Risk Alert' if clean_score > 75 else '🟢 Normal Operation'}</span>", unsafe_allow_html=True)
