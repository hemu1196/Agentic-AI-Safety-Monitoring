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

# Custom CSS styling for premium look & feel
st.markdown("""
<style>
    /* Dark theme modern styling */
    .stApp {
        background-color: #0f172a;
        color: #f8fafc;
    }
    
    /* Card Container */
    div[data-testid="stMetricValue"] {
        font-size: 2rem !important;
        font-weight: 700 !important;
        color: #38bdf8 !important;
    }
    
    .main-header {
        font-size: 2.2rem;
        font-weight: 800;
        background: linear-gradient(90deg, #38bdf8, #818cf8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    
    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background-color: #1e293b !important;
        border-right: 1px solid #334155;
    }

    /* Badges */
    .badge-success { background-color: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
    .badge-warning { background-color: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
    .badge-danger { background-color: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
    .badge-critical { background-color: #881337; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
</style>
""", unsafe_allow_html=True)

# Load data and model bundle
df = load_dataset()
bundle = load_model_bundle()

# Sidebar Navigation
with st.sidebar:
    st.markdown("<h2 style='text-align: center; color: #38bdf8;'>🏗️ Construction Hub</h2>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #94a3b8; font-size: 0.85rem;'>Intelligence & Risk Platform</p>", unsafe_allow_html=True)
    st.markdown("---")
    
    selected_page = st.radio(
        "Navigation Menu",
        [
            "📊 Executive Overview",
            "🔍 EDA & Analytics Studio",
            "🤖 ML Pipeline & Benchmark",
            "🎯 Real-Time Risk Predictor",
            "📁 Batch CSV Predictor",
            "⚡ What-If Site Simulator"
        ]
    )
    
    st.markdown("---")
    st.markdown("### 📌 System Status")
    if df is not None:
        st.success(f"Dataset Loaded ({len(df):,} rows)")
    else:
        st.error("Dataset Not Found")
        
    if bundle is not None:
        st.success(f"Model Bundle (`{bundle.get('model_name', 'Trained Model')}`)")
    else:
        st.warning("Model Bundle Missing")

    st.markdown("---")
    st.caption("B.Tech CSE ML Capstone | Construction Intelligence Hub v2.0")

# Header section
st.markdown("<h1 class='main-header'>🏗️ Construction Intelligence Hub</h1>", unsafe_allow_html=True)

# Page Routing
if selected_page == "📊 Executive Overview":
    from app_modules.overview import render_overview_page
    render_overview_page(df)

elif selected_page == "🔍 EDA & Analytics Studio":
    from app_modules.eda import render_eda_page
    render_eda_page(df)

elif selected_page == "🤖 ML Pipeline & Benchmark":
    from app_modules.ml_pipeline import render_ml_pipeline_page
    render_ml_pipeline_page(df, bundle)

elif selected_page == "🎯 Real-Time Risk Predictor":
    from app_modules.predictor import render_predictor_page
    render_predictor_page(df, bundle)

elif selected_page == "📁 Batch CSV Predictor":
    from app_modules.batch_predict import render_batch_predict_page
    render_batch_predict_page(df, bundle)

elif selected_page == "⚡ What-If Site Simulator":
    from app_modules.simulator import render_simulator_page
    render_simulator_page(df, bundle)
