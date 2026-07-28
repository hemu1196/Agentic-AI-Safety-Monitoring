import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np

def render_eda_page(df):
    st.markdown("## 🔍 Exploratory Data Analysis & Analytics Studio")
    st.markdown("Interactively inspect feature relationships, distributions, and site anomalies across 50,000 telemetry records.")
    
    if df is None:
        st.warning("Dataset unavailable.")
        return

    # Sidebar Filter Controls inside EDA
    with st.expander("🛠️ Interactive Filter & Data Controls", expanded=True):
        f_col1, f_col2, f_col3, f_col4 = st.columns(4)
        
        with f_col1:
            if "worker_count" in df.columns:
                min_w, max_w = int(df["worker_count"].min()), int(df["worker_count"].max())
                selected_workers = st.slider("Worker Count Range", min_w, max_w, (min_w, max_w))
            else:
                selected_workers = None
                
        with f_col2:
            if "temperature" in df.columns:
                min_t, max_t = float(df["temperature"].min()), float(df["temperature"].max())
                selected_temp = st.slider("Temperature Range (°C)", float(round(min_t, 1)), float(round(max_t, 1)), (float(round(min_t, 1)), float(round(max_t, 1))))
            else:
                selected_temp = None

        with f_col3:
            if "material_shortage_alert" in df.columns:
                shortage_filter = st.multiselect("Material Shortage Alert", options=[0, 1], default=[0, 1], format_func=lambda x: "Shortage Alert (1)" if x == 1 else "Normal (0)")
            else:
                shortage_filter = None

        with f_col4:
            if "optimization_suggestion" in df.columns:
                opts = list(df["optimization_suggestion"].dropna().unique())
                selected_opts = st.multiselect("Optimization Suggestion", options=opts, default=opts)
            else:
                selected_opts = None

    # Filter DataFrame
    filtered_df = df.copy()
    if selected_workers and "worker_count" in filtered_df.columns:
        filtered_df = filtered_df[(filtered_df["worker_count"] >= selected_workers[0]) & (filtered_df["worker_count"] <= selected_workers[1])]
    if selected_temp and "temperature" in filtered_df.columns:
        filtered_df = filtered_df[(filtered_df["temperature"] >= selected_temp[0]) & (filtered_df["temperature"] <= selected_temp[1])]
    if shortage_filter is not None and "material_shortage_alert" in filtered_df.columns:
        filtered_df = filtered_df[filtered_df["material_shortage_alert"].isin(shortage_filter)]
    if selected_opts and "optimization_suggestion" in filtered_df.columns:
        filtered_df = filtered_df[filtered_df["optimization_suggestion"].isin(selected_opts)]

    st.caption(f"Showing **{len(filtered_df):,}** matching rows out of {len(df):,} total records.")

    tab1, tab2, tab3, tab4 = st.tabs(["🔥 Correlation Heatmap", "📊 Feature Relationships", "🌐 3D Risk Terrain", "📋 Summary Statistics"])

    with tab1:
        st.subheader("Correlation Matrix Heatmap")
        num_cols = filtered_df.select_dtypes(include=[np.number]).columns.tolist()
        if len(num_cols) > 1:
            corr = filtered_df[num_cols].corr()
            fig_corr = px.imshow(
                corr,
                text_auto=".2f",
                color_continuous_scale="RdBu_r",
                title="Correlation Among Construction Features",
                aspect="auto"
            )
            fig_corr.update_layout(template="plotly_dark", height=550)
            st.plotly_chart(fig_corr, use_container_width=True)

    with tab2:
        st.subheader("Custom Bivariate Feature Analysis")
        c_col1, c_col2, c_col3 = st.columns(3)
        with c_col1:
            x_axis = st.selectbox("X-Axis Feature", options=num_cols, index=num_cols.index("temperature") if "temperature" in num_cols else 0)
        with c_col2:
            y_axis = st.selectbox("Y-Axis Feature", options=num_cols, index=num_cols.index("risk_score") if "risk_score" in num_cols else 1)
        with c_col3:
            cat_cols = filtered_df.select_dtypes(include=['object', 'int64']).columns.tolist()
            color_by = st.selectbox("Color / Categorize By", options=["None"] + cat_cols, index=0)

        fig_scatter = px.scatter(
            filtered_df.sample(min(2000, len(filtered_df))),
            x=x_axis,
            y=y_axis,
            color=None if color_by == "None" else color_by,
            opacity=0.7,
            title=f"{y_axis} vs {x_axis}",
            trendline="ols" if color_by == "None" else None
        )
        fig_scatter.update_layout(template="plotly_dark", height=450)
        st.plotly_chart(fig_scatter, use_container_width=True)

    with tab3:
        st.subheader("3D Interactive Feature Interaction")
        st.caption("Inspect relationships between Environmental, Operational, and Risk variables in 3D.")
        z_axis = st.selectbox("Z-Axis (Height)", options=num_cols, index=num_cols.index("risk_score") if "risk_score" in num_cols else 0)
        
        sample_3d = filtered_df.sample(min(1000, len(filtered_df)))
        fig_3d = px.scatter_3d(
            sample_3d,
            x="temperature" if "temperature" in sample_3d.columns else num_cols[0],
            y="humidity" if "humidity" in sample_3d.columns else num_cols[1],
            z=z_axis,
            color="risk_score" if "risk_score" in sample_3d.columns else None,
            color_continuous_scale="Turbo",
            title=f"3D Scatter: Temperature vs Humidity vs {z_axis}"
        )
        fig_3d.update_layout(template="plotly_dark", height=600)
        st.plotly_chart(fig_3d, use_container_width=True)

    with tab4:
        st.subheader("Numerical Feature Summary")
        st.dataframe(filtered_df.describe().T, use_container_width=True)
