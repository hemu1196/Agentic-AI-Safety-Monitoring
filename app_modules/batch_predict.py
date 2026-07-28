import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from utils import predict_single_sample, get_risk_level_info

def render_batch_predict_page(df_default, bundle):
    st.markdown("## 📁 Batch CSV Prediction & Executive Risk Report")
    st.markdown("Upload construction site logs to score hundreds or thousands of sites simultaneously.")
    
    if bundle is None:
        st.error("Model bundle unavailable.")
        return

    st.markdown("### 1️⃣ Upload Telemetry CSV File")
    uploaded_file = st.file_uploader("Upload CSV file containing site telemetry columns", type=["csv"])

    if uploaded_file is None:
        st.info("ℹ️ No file uploaded yet. You can test batch prediction using a sample batch from the default dataset.")
        use_sample = st.button("📥 Load Sample Batch (First 100 Rows from Dataset)")
        if use_sample and df_default is not None:
            batch_df = df_default.iloc[0:100].copy()
            st.session_state['batch_df'] = batch_df
    else:
        try:
            batch_df = pd.read_csv(uploaded_file)
            st.session_state['batch_df'] = batch_df
            st.success(f"Successfully loaded CSV with {len(batch_df):,} rows and {len(batch_df.columns)} columns.")
        except Exception as e:
            st.error(f"Error reading CSV file: {e}")
            return

    if 'batch_df' in st.session_state:
        b_df = st.session_state['batch_df'].copy()
        
        st.markdown("---")
        st.markdown("### 2️⃣ Execute Batch Inference")
        
        if st.button("🚀 Run Batch Scoring Pipeline", type="primary", use_container_width=True):
            with st.spinner("Scoring rows and generating risk metrics..."):
                predictions = []
                risk_levels = []
                
                # Perform vector/iterative predictions
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
        
        st.success(f"✅ Batch Scoring Complete for {len(scored_df):,} sites!")
        
        # KPI Summary
        high_risk_count = len(scored_df[scored_df["Risk_Category"].isin(["HIGH RISK", "CRITICAL RISK"])])
        avg_batch_risk = scored_df["Predicted_Risk_Score"].mean()
        
        bc1, bc2, bc3 = st.columns(3)
        with bc1:
            st.metric("Total Scored Sites", f"{len(scored_df):,}")
        with bc2:
            st.metric("Average Batch Risk", f"{avg_batch_risk:.1f}")
        with bc3:
            st.metric("High/Critical Risk Alerts", f"{high_risk_count:,}", delta=f"{high_risk_count} sites flagged", delta_color="inverse")

        st.markdown("### 📊 Scored Batch Risk Distribution")
        fig_batch_hist = px.histogram(
            scored_df,
            x="Predicted_Risk_Score",
            color="Risk_Category",
            nbins=30,
            title="Batch Risk Score Histogram",
            color_discrete_map={
                "LOW RISK": "#10b981",
                "MODERATE RISK": "#f59e0b",
                "HIGH RISK": "#ef4444",
                "CRITICAL RISK": "#881337"
            }
        )
        fig_batch_hist.update_layout(template="plotly_dark", height=350)
        st.plotly_chart(fig_batch_hist, use_container_width=True)

        st.markdown("### 📋 Scored Results Table")
        st.dataframe(scored_df, use_container_width=True)

        csv_data = scored_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Download Scored Predictions CSV",
            data=csv_data,
            file_name="construction_risk_scored_batch.csv",
            mime="text/csv",
            use_container_width=True,
            type="primary"
        )
