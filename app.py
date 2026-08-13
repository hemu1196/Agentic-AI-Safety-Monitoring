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

# Custom High-End Aesthetics & Futuristic Visual Box Navigation CSS
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
        border-right: 1px solid rgba(56, 189, 248, 0.2);
    }
    
    /* Glowing Box Category Section Headers */
    .sidebar-category-box {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-left: 4px solid #38bdf8;
        border-radius: 12px;
        padding: 10px 14px;
        margin: 16px 0 10px 0;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    .sidebar-category-title {
        font-family: 'Outfit', sans-serif;
        font-size: 0.82rem;
        font-weight: 800;
        color: #38bdf8;
        letter-spacing: 0.08em;
        text-transform: uppercase;
    }

    /* Transform Streamlit Radio Items into Prominent Visual Box Cards */
    div[data-testid="stSidebar"] div[role="radiogroup"] {
        gap: 6px;
    }

    div[data-testid="stSidebar"] div[role="radiogroup"] label {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%) !important;
        border: 1.5px solid rgba(255, 255, 255, 0.12) !important;
        border-radius: 14px !important;
        padding: 12px 16px !important;
        margin-bottom: 6px !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        color: #f8fafc !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
        display: flex !important;
        align-items: center !important;
    }
    
    div[data-testid="stSidebar"] div[role="radiogroup"] label:hover {
        background: linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(129, 140, 248, 0.2) 100%) !important;
        border-color: #38bdf8 !important;
        transform: translateY(-2px) scale(1.01) !important;
        color: #ffffff !important;
        box-shadow: 0 8px 24px rgba(56, 189, 248, 0.35) !important;
    }

    /* Highlight Active Selected Box */
    div[data-testid="stSidebar"] div[role="radiogroup"] label[data-checked="true"] {
        background: linear-gradient(135deg, #38bdf8 0%, #6366f1 100%) !important;
        border-color: #7dd3fc !important;
        color: #ffffff !important;
        box-shadow: 0 6px 20px rgba(56, 189, 248, 0.45) !important;
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

# Sidebar Navigation Hub (All Boxes Visible, Zero Dropdowns)
with st.sidebar:
    st.markdown("""
    <div style="text-align: center; padding: 10px 0 16px 0;">
        <div style="display: inline-block; background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%); padding: 10px; border-radius: 50%;">
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
    
    st.markdown("<div style='height: 1px; background: rgba(255,255,255,0.08); margin-bottom: 12px;'></div>", unsafe_allow_html=True)
    
    # Visible Box Radio Navigation
    st.markdown("""
    <div class="sidebar-category-box">
        <div class="sidebar-category-title">🤖 AGENTIC SAFETY & CV SURVEILLANCE</div>
    </div>
    """, unsafe_allow_html=True)

    selected_page = st.radio(
        "Navigation Menu",
        [
            "🚪 Agentic Entry Safety Gate",
            "🎥 Agentic Live Surveillance",
            "🚁 Drone AI & CV PPE Safety",
            "📊 Agentic Safety DB & Analytics",
            "📊 Executive Overview",
            "⚠️ Site Risk & Hazard Detection",
            "🦺 Safety & Worker Protection",
            "📜 Compliance & Insurance Intelligence",
            "🎯 Real-Time Risk Predictor",
            "🤖 ML Pipeline & Benchmark",
            "📁 Batch CSV Predictor",
            "⚡ What-If Site Simulator",
            "🌐 3D Digital Twin Viewer",
            "🔍 EDA & Analytics Studio"
        ],
        label_visibility="collapsed"
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
