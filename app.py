import streamlit as st
import os
from utils import load_dataset, load_model_bundle

# Set Streamlit Page Config
st.set_page_config(
    page_title="Construction Intelligence Hub",
    page_icon="🏗️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom High-End Aesthetics & Modern Glassmorphism CSS Design System
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
        padding: 28px 36px;
        margin-bottom: 28px;
        box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
    }
    
    .hero-title {
        font-family: 'Outfit', sans-serif;
        font-size: 2.6rem;
        font-weight: 800;
        background: linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
        letter-spacing: -0.02em;
    }
    
    .hero-subtitle {
        color: #94a3b8;
        font-size: 1.05rem;
        font-weight: 400;
        margin-top: 6px;
    }
    
    /* Custom Sidebar Styling */
    section[data-testid="stSidebar"] {
        background: rgba(15, 23, 42, 0.95) !important;
        backdrop-filter: blur(20px);
        border-right: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    /* Custom Radio Navigation Buttons */
    div[data-testid="stSidebar"] div[role="radiogroup"] label {
        background: rgba(30, 41, 59, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 10px 16px;
        margin-bottom: 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: #cbd5e1 !important;
        font-weight: 600;
    }
    
    div[data-testid="stSidebar"] div[role="radiogroup"] label:hover {
        background: rgba(56, 189, 248, 0.15);
        border-color: rgba(56, 189, 248, 0.4);
        transform: translateX(4px);
        color: #38bdf8 !important;
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
    
    /* Expander styling */
    .streamlit-expanderHeader {
        background: rgba(30, 41, 59, 0.6) !important;
        border-radius: 12px !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        color: #38bdf8 !important;
        font-weight: 700 !important;
    }
</style>
""", unsafe_allow_html=True)

# Load dataset and model bundle
df = load_dataset()
bundle = load_model_bundle()

# Sidebar Navigation
with st.sidebar:
    st.markdown("""
    <div style="text-align: center; padding: 10px 0 20px 0;">
        <div style="font-size: 2.8rem; margin-bottom: 4px;">🏗️</div>
        <div style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; font-weight: 800; background: linear-gradient(90deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            CONSTRUCTION HUB
        </div>
        <div style="font-size: 0.75rem; color: #94a3b8; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">
            Intelligence & Risk Platform
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("<div style='height: 1px; background: rgba(255,255,255,0.08); margin-bottom: 20px;'></div>", unsafe_allow_html=True)
    
    selected_page = st.radio(
        "Navigation Menu",
        [
            "📊 Executive Overview",
            "⚠️ Site Risk & Hazard Detection",
            "🦺 Safety & Worker Protection",
            "🚁 Drone AI & CV PPE Safety",
            "📜 Compliance & Insurance Intelligence",
            "🔍 EDA & Analytics Studio",
            "🤖 ML Pipeline & Benchmark",
            "🎯 Real-Time Risk Predictor",
            "🌐 3D Digital Twin Viewer",
            "📁 Batch CSV Predictor",
            "⚡ What-If Site Simulator"
        ]
    )
    
    st.markdown("<div style='height: 1px; background: rgba(255,255,255,0.08); margin: 20px 0;'></div>", unsafe_allow_html=True)
    st.markdown("### 📌 System Status")
    
    if df is not None:
        st.markdown(f"""
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 10px; margin-bottom: 8px;">
            <div style="font-size: 0.75rem; color: #34d399; font-weight: 700;">DATASET READY</div>
            <div style="font-size: 0.9rem; color: #f8fafc; font-weight: 600;">{len(df):,} Telemetry Records</div>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.error("Dataset Missing")
        
    if bundle is not None:
        st.markdown(f"""
        <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 10px;">
            <div style="font-size: 0.75rem; color: #38bdf8; font-weight: 700;">MODEL BUNDLE LOADED</div>
            <div style="font-size: 0.9rem; color: #f8fafc; font-weight: 600;">{bundle.get('model_name', 'Trained Model')}</div>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.warning("Model Bundle Missing")

    st.markdown("<div style='height: 1px; background: rgba(255,255,255,0.08); margin: 20px 0;'></div>", unsafe_allow_html=True)
    st.caption("⚡ Powered by Machine Learning & Telemetry Analytics v2.0")

# Top Banner Header
st.markdown("""
<div class="hero-banner">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h1 class="hero-title">Construction Intelligence Hub</h1>
            <p class="hero-subtitle">Predictive Site Risk Analytics • Telemetry Monitoring • AI Decision Engine</p>
        </div>
        <div style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); padding: 8px 16px; border-radius: 30px; font-size: 0.85rem; color: #38bdf8; font-weight: 700;">
            🟢 LIVE SYSTEM MONITOR
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Page Routing
if selected_page == "📊 Executive Overview":
    from app_modules.overview import render_overview_page
    render_overview_page(df)

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
