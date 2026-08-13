import streamlit as st
import os
from utils import load_dataset, load_model_bundle

# Set Streamlit Page Config
st.set_page_config(
    page_title="Agentic AI Safety Monitoring With Construction Risk Analytics",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom High-End Aesthetics & Futuristic Glassmorphism Navigation CSS
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

    /* Global Reset & Typography */
    html, body, p, div, h1, h2, h3, h4, h5, h6, label, input, button {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    /* Preserve Streamlit Material Symbols Icons font */
    .material-symbols-outlined,
    .material-icons,
    [data-testid="stIcon"],
    [class*="material-symbols"],
    [data-testid="stSidebarCollapseButton"] *,
    [data-testid="collapsedControl"] * {
        font-family: 'Material Symbols Outlined', 'Material Icons', sans-serif !important;
    }
    
    .stApp {
        background: radial-gradient(circle at 15% 15%, #1e293b 0%, #0f172a 50%, #090d16 100%);
        color: #f8fafc;
    }
    
    /* Header Banner Styling */
    .hero-banner {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 24px 32px;
        margin-bottom: 24px;
        box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
    }
    
    .hero-title {
        font-family: 'Outfit', sans-serif;
        font-size: 2.3rem;
        font-weight: 800;
        background: linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
        letter-spacing: -0.02em;
    }
    
    .hero-subtitle {
        color: #94a3b8;
        font-size: 1.02rem;
        font-weight: 400;
        margin-top: 6px;
    }
    
    /* Unique Sidebar Styling */
    section[data-testid="stSidebar"] {
        background: rgba(15, 23, 42, 0.96) !important;
        backdrop-filter: blur(24px);
        border-right: 1px solid rgba(56, 189, 248, 0.15);
    }
    
    /* Glassmorphic Category Card Header */
    .nav-category-header {
        background: linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(129, 140, 248, 0.08) 100%);
        border: 1px solid rgba(56, 189, 248, 0.25);
        border-radius: 14px;
        padding: 14px 16px;
        margin-bottom: 14px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    .nav-category-title {
        font-family: 'Outfit', sans-serif;
        font-size: 0.85rem;
        font-weight: 800;
        color: #38bdf8;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    /* Custom Radio Navigation Buttons */
    div[data-testid="stSidebar"] div[role="radiogroup"] label {
        background: rgba(30, 41, 59, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 11px 16px;
        margin-bottom: 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: #cbd5e1 !important;
        font-weight: 600;
    }
    
    div[data-testid="stSidebar"] div[role="radiogroup"] label:hover {
        background: rgba(56, 189, 248, 0.18);
        border-color: rgba(56, 189, 248, 0.5);
        transform: translateX(6px);
        color: #38bdf8 !important;
        box-shadow: 0 4px 16px rgba(56, 189, 248, 0.25);
    }

    /* Tab Styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background: rgba(30, 41, 59, 0.4);
        padding: 6px;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .stTabs [data-baseweb="tab"] {
        height: 44px;
        border-radius: 10px;
        color: #94a3b8;
        font-weight: 600;
        font-size: 0.95rem;
        border: none !important;
        background: transparent;
        padding: 0 20px;
    }

    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 14px 0 rgba(56, 189, 248, 0.35);
    }
    
    /* Custom Streamlit Buttons */
    div.stButton > button {
        background: linear-gradient(135deg, #38bdf8 0%, #6366f1 100%);
        color: #ffffff;
        font-weight: 700;
        font-family: 'Outfit', sans-serif;
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        box-shadow: 0 4px 20px rgba(56, 189, 248, 0.3);
        transition: all 0.3s ease;
    }
    
    div.stButton > button:hover {
        background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%);
        box-shadow: 0 6px 24px rgba(56, 189, 248, 0.5);
        transform: translateY(-2px);
    }
    
    /* Input Form Glass Panels */
    div[data-testid="stForm"] {
        background: rgba(30, 41, 59, 0.5);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
</style>
""", unsafe_allow_html=True)

# Load dataset and model bundle
df = load_dataset()
bundle = load_model_bundle()

# Sidebar Navigation Hub
with st.sidebar:
    st.markdown("""
    <div style="text-align: center; padding: 12px 0 18px 0;">
        <div style="display: inline-block; background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%); padding: 12px; border-radius: 50%;">
            <div style="font-size: 2.6rem;">🛡️</div>
        </div>
        <div style="font-family: 'Outfit', sans-serif; font-size: 1.3rem; font-weight: 800; background: linear-gradient(90deg, #38bdf8, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-top: 4px;">
            AGENTIC SAFETY AI
        </div>
        <div style="font-size: 0.70rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px;">
            Autonomous Command Hub v2.0
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("<div style='height: 1px; background: rgba(255,255,255,0.08); margin-bottom: 16px;'></div>", unsafe_allow_html=True)
    
    # Categorized Tactical Suite Selector
    selected_suite = st.selectbox(
        "🎯 Tactical Suite Hub:",
        [
            "🤖 Agentic Safety & Surveillance Suite",
            "⚠️ Site Risk & Worker Protection Suite",
            "🧠 Predictive ML & Simulation Studio",
            "🌐 3D Digital Twin & Analytics Studio"
        ]
    )

    st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)

    # Sub-Module Page Routing per Selected Suite
    if selected_suite == "🤖 Agentic Safety & Surveillance Suite":
        st.markdown("""
        <div class="nav-category-header">
            <div class="nav-category-title">🤖 Agentic Safety Modules</div>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">Real-Time AI Vision & Gate Control</div>
        </div>
        """, unsafe_allow_html=True)
        
        selected_page = st.radio(
            "Select Module:",
            [
                "🚪 Agentic Entry Safety Gate",
                "🎥 Agentic Live Surveillance",
                "🚁 Drone AI & CV PPE Safety",
                "📊 Agentic Safety DB & Analytics"
            ]
        )

    elif selected_suite == "⚠️ Site Risk & Worker Protection Suite":
        st.markdown("""
        <div class="nav-category-header">
            <div class="nav-category-title">⚠️ Risk & Protection Modules</div>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">Hazard Alerts & Compliance Audits</div>
        </div>
        """, unsafe_allow_html=True)

        selected_page = st.radio(
            "Select Module:",
            [
                "📊 Executive Overview",
                "⚠️ Site Risk & Hazard Detection",
                "🦺 Safety & Worker Protection",
                "📜 Compliance & Insurance Intelligence"
            ]
        )

    elif selected_suite == "🧠 Predictive ML & Simulation Studio":
        st.markdown("""
        <div class="nav-category-header">
            <div class="nav-category-title">🧠 Machine Learning Studio</div>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">Inference, Training & Simulation</div>
        </div>
        """, unsafe_allow_html=True)

        selected_page = st.radio(
            "Select Module:",
            [
                "🎯 Real-Time Risk Predictor",
                "🤖 ML Pipeline & Benchmark",
                "📁 Batch CSV Predictor",
                "⚡ What-If Site Simulator"
            ]
        )

    else:
        st.markdown("""
        <div class="nav-category-header">
            <div class="nav-category-title">🌐 Digital Twin & Analytics</div>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">WebGL 3D Site Model & Exploratory Data</div>
        </div>
        """, unsafe_allow_html=True)

        selected_page = st.radio(
            "Select Module:",
            [
                "🌐 3D Digital Twin Viewer",
                "🔍 EDA & Analytics Studio"
            ]
        )

    st.markdown("<div style='height: 1px; background: rgba(255,255,255,0.08); margin: 18px 0;'></div>", unsafe_allow_html=True)
    st.markdown("### 📌 System Health")
    
    if df is not None:
        st.markdown(f"""
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 12px; margin-bottom: 8px;">
            <div style="font-size: 0.72rem; color: #34d399; font-weight: 800; letter-spacing: 0.05em;">TELEMETRY DATASET</div>
            <div style="font-size: 0.95rem; color: #f8fafc; font-weight: 700;">{len(df):,} Active Records</div>
        </div>
        """, unsafe_allow_html=True)
        
    if bundle is not None:
        st.markdown(f"""
        <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 12px;">
            <div style="font-size: 0.72rem; color: #38bdf8; font-weight: 800; letter-spacing: 0.05em;">ML MODEL ENGINE</div>
            <div style="font-size: 0.95rem; color: #f8fafc; font-weight: 700;">{bundle.get('model_name', 'Trained Model')}</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<div style='height: 1px; background: rgba(255,255,255,0.08); margin: 18px 0;'></div>", unsafe_allow_html=True)
    st.caption("⚡ Agentic AI Safety Command v2.0")

# Top Banner Header
st.markdown("""
<div class="hero-banner">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h1 class="hero-title">Agentic AI Safety Monitoring With Construction Risk Analytics</h1>
            <p class="hero-subtitle">Autonomous Site Surveillance • Computer Vision PPE Inspection • Predictive Risk Analytics</p>
        </div>
        <div style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); padding: 8px 18px; border-radius: 30px; font-size: 0.85rem; color: #38bdf8; font-weight: 800;">
            🟢 LIVE SYSTEM MONITOR
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Page Routing
if selected_page == "📊 Executive Overview":
    from app_modules.overview import render_overview_page
    render_overview_page(df)

elif selected_page == "🚪 Agentic Entry Safety Gate":
    from app_modules.agentic_entry_gate import render_agentic_entry_gate_page
    render_agentic_entry_gate_page()

elif selected_page == "🎥 Agentic Live Surveillance":
    from app_modules.agentic_live_monitor import render_agentic_live_monitor_page
    render_agentic_live_monitor_page()

elif selected_page == "📊 Agentic Safety DB & Analytics":
    from app_modules.agentic_analytics import render_agentic_analytics_page
    render_agentic_analytics_page()

elif selected_page == "⚠️ Site Risk & Hazard Detection":
    from app_modules.hazard_detection import render_hazard_detection_page
    render_hazard_detection_page(df)

elif selected_page == "🦺 Safety & Worker Protection":
    from app_modules.safety_intelligence import render_safety_intelligence_page
    render_safety_intelligence_page(df)

elif selected_page == "🚁 Drone AI & CV PPE Safety":
    from app_modules.drone_cv_safety import render_drone_cv_safety_page
    render_drone_cv_safety_page(df)

elif selected_page == "📜 Compliance & Insurance Intelligence":
    from app_modules.insurance_compliance import render_insurance_compliance_page
    render_insurance_compliance_page(df, bundle)

elif selected_page == "🔍 EDA & Analytics Studio":
    from app_modules.eda import render_eda_page
    render_eda_page(df)

elif selected_page == "🤖 ML Pipeline & Benchmark":
    from app_modules.ml_pipeline import render_ml_pipeline_page
    render_ml_pipeline_page(df, bundle)

elif selected_page == "🎯 Real-Time Risk Predictor":
    from app_modules.predictor import render_predictor_page
    render_predictor_page(df, bundle)

elif selected_page == "🌐 3D Digital Twin Viewer":
    from app_modules.digital_twin_3d import render_3d_digital_twin_page
    render_3d_digital_twin_page(df, bundle)

elif selected_page == "📁 Batch CSV Predictor":
    from app_modules.batch_predict import render_batch_predict_page
    render_batch_predict_page(df, bundle)

elif selected_page == "⚡ What-If Site Simulator":
    from app_modules.simulator import render_simulator_page
    render_simulator_page(df, bundle)
