import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from utils import predict_single_sample, get_risk_level_info, render_glass_card, apply_plotly_theme

def render_batch_predict_page(df_default, bundle):
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">📁 Batch CSV Prediction & Executive Report</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Upload telemetry CSV files to score multiple sites simultaneously.</p>
    </div>
    """, unsafe_allow_html=True)
    
    if bundle is None:
        st.error("Model bundle unavailable.")
        return

    st.markdown("### 1️⃣ Upload Telemetry Dataset")
    uploaded_file = st.file_uploader("Upload CSV file containing site telemetry", type=["csv"])

    if uploaded_file is None:
        st.info("ℹ️ No file uploaded yet. You can test batch prediction using the sample batch below.")
        if st.button("📥 Load Sample Batch (100 Records from Dataset)"):
            if df_default is not None:
                st.session_state['batch_df'] = df_default.iloc[0:100].copy()
    else:
        try:
            batch_df = pd.read_csv(uploaded_file)
            st.session_state['batch_df'] = batch_df
            st.success(f"Loaded {len(batch_df):,} rows.")
        except Exception as e:
            st.error(f"Error loading CSV: {e}")
            return

    if 'batch_df' in st.session_state:
        b_df = st.session_state['batch_df'].copy()
        
        st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)
        if st.button("🚀 Execute Batch Risk Inference", type="primary", use_container_width=True):
            with st.spinner("Scoring batch telemetry rows..."):
                predictions = []
                risk_levels = []
                
                for idx, row in b_df.iterrows():
                    score, err = predict_single_sample(row.to_dict(), bundle)
                    clean_score = max(0.0, min(100.0, float(score))) if score is not None else 0.0
                    predictions.append(clean_score)
                    risk_levels.append(get_risk_level_info(clean_score)['level'])
                    
                b_df["Predicted_Risk_Score"] = predictions
                b_df["Risk_Category"] = risk_levels
                st.session_state['scored_batch_df'] = b_df
                
    if 'scored_batch_df' in st.session_state:
        scored_df = st.session_state['scored_batch_df']
        
        st.success(f"✅ Batch Scoring Complete for {len(scored_df):,} records!")
        
        high_risk_count = len(scored_df[scored_df["Risk_Category"].isin(["HIGH RISK", "CRITICAL RISK"])])
        avg_batch_risk = scored_df["Predicted_Risk_Score"].mean()
        
        bc1, bc2, bc3 = st.columns(3)
        with bc1:
            st.markdown(render_glass_card("Total Scored Sites", f"{len(scored_df):,}", "Batch record count", "📊"), unsafe_allow_html=True)
        with bc2:
            st.markdown(render_glass_card("Average Batch Risk", f"{avg_batch_risk:.1f}", "Overall score average", "🛡️", "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"), unsafe_allow_html=True)
        with bc3:
            st.markdown(render_glass_card("High/Critical Alerts", f"{high_risk_count:,}", "Requires intervention", "🚨", "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"), unsafe_allow_html=True)

        fig_batch_hist = px.histogram(
            scored_df,
            x="Predicted_Risk_Score",
            color="Risk_Category",
            nbins=30,
            title="Batch Risk Score Distribution",
            color_discrete_map={
                "LOW RISK": "#10b981",
                "MODERATE RISK": "#f59e0b",
                "HIGH RISK": "#ef4444",
                "CRITICAL RISK": "#f43f5e"
            }
        )
        apply_plotly_theme(fig_batch_hist, height=350)
        st.plotly_chart(fig_batch_hist, use_container_width=True)

        st.markdown("### 📋 Scored Results")
        st.dataframe(scored_df, use_container_width=True)

        csv_data = scored_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Scored Batch Predictions CSV",
            data=csv_data,
            file_name="construction_risk_scored_batch.csv",
            mime="text/csv",
            use_container_width=True,
            type="primary"
        )
