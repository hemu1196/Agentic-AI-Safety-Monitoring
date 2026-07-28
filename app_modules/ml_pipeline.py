import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from utils import train_custom_models, render_glass_card, apply_plotly_theme

def render_ml_pipeline_page(df, bundle):
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">🤖 Machine Learning Pipeline & Leaderboard</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">Train, evaluate, and benchmark multiple ML algorithms side-by-side.</p>
    </div>
    """, unsafe_allow_html=True)
    
    if df is None:
        st.warning("Dataset unavailable.")
        return

    st.markdown("### 1️⃣ Pre-trained Model Summary (`best_model.pkl`)")
    if bundle:
        b1, b2, b3, b4 = st.columns(4)
        with b1:
            st.markdown(render_glass_card("Model Algorithm", bundle.get('model_name', 'Linear Regression'), "Trained & Pickled", "🧠", "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)"), unsafe_allow_html=True)
        with b2:
            st.markdown(render_glass_card("Target Variable", bundle.get('target_column', 'risk_score'), "Primary target", "🎯", "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"), unsafe_allow_html=True)
        with b3:
            st.markdown(render_glass_card("Problem Type", bundle.get('problem_type', 'regression').capitalize(), "ML Task Class", "⚡", "linear-gradient(135deg, #10b981 0%, #34d399 100%)"), unsafe_allow_html=True)
        with b4:
            st.markdown(render_glass_card("Feature Count", f"{len(bundle.get('feature_columns', []))}", "Predictor features", "📐", "linear-gradient(135deg, #c084fc 0%, #e879f9 100%)"), unsafe_allow_html=True)

    st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)
    st.markdown("### 2️⃣ Dynamic Algorithm Training & Leaderboard")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.markdown("#### ⚙️ Configure Training")
        numeric_and_cat_cols = df.columns.tolist()
        if 'timestamp' in numeric_and_cat_cols:
            numeric_and_cat_cols.remove('timestamp')
            
        target_col = st.selectbox(
            "Select Target Variable",
            options=numeric_and_cat_cols,
            index=numeric_and_cat_cols.index("risk_score") if "risk_score" in numeric_and_cat_cols else 0
        )
        
        is_classification = df[target_col].dtype == 'object' or df[target_col].nunique() < 10
        st.caption(f"Task Mode: **{'Classification' if is_classification else 'Regression'}**")

        if not is_classification:
            avail_models = ["Linear Regression", "Ridge Regression", "Lasso Regression", "Decision Tree", "Random Forest", "Gradient Boosting", "Extra Trees"]
            default_selected = ["Linear Regression", "Decision Tree", "Random Forest"]
        else:
            avail_models = ["Decision Tree", "Random Forest", "Gradient Boosting", "Extra Trees"]
            default_selected = ["Decision Tree", "Random Forest"]

        selected_models = st.multiselect("Select Algorithms", options=avail_models, default=default_selected)
        test_ratio = st.slider("Test Split Ratio", 0.1, 0.4, 0.2, step=0.05)
        
        train_btn = st.button("🚀 Train & Benchmark Models", use_container_width=True, type="primary")

    with col2:
        if train_btn:
            if not selected_models:
                st.error("Please select at least one algorithm.")
            else:
                with st.spinner("Training ML models and evaluating metrics..."):
                    df_train_sample = df.sample(min(10000, len(df)), random_state=42)
                    
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
            
            st.success("✅ Training & Benchmarking Complete!")
            st.markdown("#### 🏆 Leaderboard Rankings")
            st.dataframe(results_df, use_container_width=True)

            primary_metric = "R2 Score" if not res_bundle['is_classification'] else "Accuracy"
            fig_bar = px.bar(
                results_df,
                x="Model",
                y=primary_metric,
                color="Model",
                text=primary_metric,
                title=f"Model Performance Comparison ({primary_metric})",
                color_discrete_sequence=px.colors.qualitative.Pastel
            )
            apply_plotly_theme(fig_bar, height=340)
            st.plotly_chart(fig_bar, use_container_width=True)

            trained_models = res_bundle['models']
            tree_models = {k: v for k, v in trained_models.items() if hasattr(v, 'feature_importances_')}
            if tree_models:
                st.markdown("#### 🌲 Feature Importance Rankings")
                chosen_tree = st.selectbox("Select Model", options=list(tree_models.keys()))
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
                    title=f"Top 10 Feature Importances ({chosen_tree})",
                    color="Importance",
                    color_continuous_scale="Viridis"
                )
                apply_plotly_theme(fig_feat, height=360)
                st.plotly_chart(fig_feat, use_container_width=True)
