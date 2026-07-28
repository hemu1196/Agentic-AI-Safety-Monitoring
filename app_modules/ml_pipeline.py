import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from utils import train_custom_models

def render_ml_pipeline_page(df, bundle):
    st.markdown("## 🤖 Machine Learning Pipeline & Benchmark Studio")
    st.markdown("Train, evaluate, and benchmark multiple ML algorithms side-by-side on construction telemetry data.")
    
    if df is None:
        st.warning("Dataset unavailable.")
        return

    st.subheader("1️⃣ Pre-trained Model Summary (`best_model.pkl`)")
    if bundle:
        b1, b2, b3, b4 = st.columns(4)
        with b1:
            st.info(f"**Model Name**: {bundle.get('model_name', 'Linear Regression')}")
        with b2:
            st.info(f"**Target Column**: `{bundle.get('target_column', 'risk_score')}`")
        with b3:
            st.info(f"**Problem Type**: `{bundle.get('problem_type', 'regression')}`")
        with b4:
            st.info(f"**Features**: `{len(bundle.get('feature_columns', []))}` columns")
    else:
        st.warning("No pre-trained model bundle loaded.")

    st.markdown("---")
    st.subheader("2️⃣ Dynamic Model Training & Benchmarking Studio")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.markdown("#### Configure Training Parameters")
        numeric_and_cat_cols = df.columns.tolist()
        if 'timestamp' in numeric_and_cat_cols:
            numeric_and_cat_cols.remove('timestamp')
            
        target_col = st.selectbox(
            "Select Target Column to Predict",
            options=numeric_and_cat_cols,
            index=numeric_and_cat_cols.index("risk_score") if "risk_score" in numeric_and_cat_cols else 0
        )
        
        is_classification = df[target_col].dtype == 'object' or df[target_col].nunique() < 10
        st.caption(f"Detected Task Type: **{'Classification' if is_classification else 'Regression'}**")

        if not is_classification:
            avail_models = ["Linear Regression", "Ridge Regression", "Lasso Regression", "Decision Tree", "Random Forest", "Gradient Boosting", "Extra Trees"]
            default_selected = ["Linear Regression", "Decision Tree", "Random Forest"]
        else:
            avail_models = ["Decision Tree", "Random Forest", "Gradient Boosting", "Extra Trees"]
            default_selected = ["Decision Tree", "Random Forest"]

        selected_models = st.multiselect("Select Algorithms to Train", options=avail_models, default=default_selected)
        test_ratio = st.slider("Test Dataset Ratio", 0.1, 0.4, 0.2, step=0.05)
        
        train_btn = st.button("🚀 Run Model Training Pipeline", use_container_width=True, type="primary")

    with col2:
        if train_btn:
            if not selected_models:
                st.error("Please select at least one algorithm to train.")
            else:
                with st.spinner("Training models and computing performance metrics..."):
                    # Use a sample for fast GUI training if dataset is huge
                    sample_size = min(10000, len(df))
                    df_train_sample = df.sample(sample_size, random_state=42)
                    
                    results_bundle = train_custom_models(
                        df_train_sample,
                        target_col=target_col,
                        selected_model_names=selected_models,
                        test_size=test_ratio
                    )
                    
                    st.session_state['custom_train_results'] = results_bundle

        if 'custom_train_results' in st.session_state:
            res_bundle = st.session_state['custom_train_results']
            results_df = res_bundle['results_df']
            
            st.success("✅ Training Pipeline Complete!")
            st.markdown("#### 🏆 Leaderboard Comparison")
            st.dataframe(results_df, use_container_width=True)

            primary_metric = "R2 Score" if not res_bundle['is_classification'] else "Accuracy"
            fig_bar = px.bar(
                results_df,
                x="Model",
                y=primary_metric,
                color="Model",
                text=primary_metric,
                title=f"Model Performance Comparison ({primary_metric})",
                color_discrete_sequence=px.colors.qualitative.Bold
            )
            fig_bar.update_layout(template="plotly_dark", height=350)
            st.plotly_chart(fig_bar, use_container_width=True)

            # Feature Importance for Tree models if available
            trained_models = res_bundle['models']
            tree_models = {k: v for k, v in trained_models.items() if hasattr(v, 'feature_importances_')}
            if tree_models:
                st.markdown("#### 🌲 Feature Importance Analysis")
                chosen_tree = st.selectbox("Select Model for Feature Importance", options=list(tree_models.keys()))
                model_obj = tree_models[chosen_tree]
                importances = model_obj.feature_importances_
                feat_df = pd.DataFrame({
                    "Feature": res_bundle['feature_cols'],
                    "Importance": importances
                }).sort_values(by="Importance", ascending=True)

                fig_feat = px.bar(
                    feat_df.tail(10),
                    x="Importance",
                    y="Feature",
                    orientation="h",
                    title=f"Top 10 Important Features ({chosen_tree})",
                    color="Importance",
                    color_continuous_scale="Viridis"
                )
                fig_feat.update_layout(template="plotly_dark", height=380)
                st.plotly_chart(fig_feat, use_container_width=True)
