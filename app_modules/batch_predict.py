import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from utils import predict_single_sample, get_risk_level_info, render_glass_card, apply_plotly_theme

def render_batch_predict_page(df_default, bundle):
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">📁 Batch CSV Prediction & Executive Risk Report</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Upload telemetry CSV files to score multiple sites simultaneously with AI inference.</p>
    </div>
    """, unsafe_allow_html=True)
    
    if bundle is None:
        st.error("Model bundle unavailable.")
        return

    st.markdown("### 1️⃣ Telemetry CSV Dataset Upload")
    uploaded_file = st.file_uploader("Upload CSV file containing construction site telemetry", type=["csv"])

    if uploaded_file is None:
        st.info("ℹ️ No file uploaded yet. Click below to load a sample batch of 100 rows from the dataset.")
        if st.button("📥 Load Sample Batch (100 Rows)"):
            if df_default is not None:
                st.session_state['batch_df'] = df_default.iloc[0:100].copy()
    else:
        try:
            batch_df = pd.read_csv(uploaded_file)
            st.session_state['batch_df'] = batch_df
            st.success(f"Successfully loaded CSV with {len(batch_df):,} rows.")
        except Exception as e:
            st.error(f"Error reading CSV file: {e}")
            return

    if 'batch_df' in st.session_state:
        b_df = st.session_state['batch_df'].copy()
        
        st.markdown("<div style='height: 12px;'></div>", unsafe_allow_html=True)
        if st.button("🚀 Execute Batch Risk Inference", type="primary", use_container_width=True):
            predictions = []
            risk_levels = []
            
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            total_rows = len(b_df)
            for idx, row in b_df.iterrows():
                score, err = predict_single_sample(row.to_dict(), bundle)
                clean_score = max(0.0, min(100.0, float(score))) if score is not None else 0.0
                predictions.append(clean_score)
                risk_levels.append(get_risk_level_info(clean_score)['level'])
                
                if total_rows > 10 and idx % max(1, total_rows // 20) == 0:
                    prog_val = min(1.0, (idx + 1) / total_rows)
                    progress_bar.progress(prog_val)
                    status_text.caption(f"Scoring record {idx + 1} of {total_rows}...")
                    
            progress_bar.progress(1.0)
            status_text.empty()
            
            b_df["Predicted_Risk_Score"] = predictions
            b_df["Risk_Category"] = risk_levels
            st.session_state['scored_batch_df'] = b_df
                
    if 'scored_batch_df' in st.session_state:
        scored_df = st.session_state['scored_batch_df']
        
        st.success(f"✅ Batch Risk Scoring Completed for {len(scored_df):,} records!")
        
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
            title="Batch Risk Score Histogram Distribution",
            color_discrete_map={
                "LOW RISK": "#10b981",
                "MODERATE RISK": "#f59e0b",
                "HIGH RISK": "#ef4444",
                "CRITICAL RISK": "#f43f5e"
            }
        )
        apply_plotly_theme(fig_batch_hist, height=350)
        st.plotly_chart(fig_batch_hist, use_container_width=True, config={'displayModeBar': False})

        st.markdown("### 📋 Scored Dataset Output")
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
