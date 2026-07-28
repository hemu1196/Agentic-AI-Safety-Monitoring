import os
import warnings
warnings.filterwarnings('ignore')

import joblib
import pandas as pd
import numpy as np
import streamlit as st
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier, ExtraTreesRegressor, ExtraTreesClassifier
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, accuracy_score, precision_score, recall_score, f1_score

DATA_PATH = os.path.join(os.path.dirname(__file__), "construction_project_dataset.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "best_model.pkl")

@st.cache_data
def load_dataset():
    if os.path.exists(DATA_PATH):
        try:
            df = pd.read_csv(DATA_PATH)
            return df
        except Exception:
            return None
    return None

@st.cache_resource
def load_model_bundle():
    if os.path.exists(MODEL_PATH):
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                bundle = joblib.load(MODEL_PATH)
            return bundle
        except Exception as e:
            st.error(f"Error loading model bundle: {e}")
            return None
    return None

def apply_plotly_theme(fig, height=360, title=None):
    """Applies a flawless, responsive dark glassmorphic design theme to Plotly figures."""
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0, 0, 0, 0)",
        plot_bgcolor="rgba(15, 23, 42, 0.4)",
        font=dict(family="Plus Jakarta Sans, sans-serif", color="#f8fafc", size=12),
        title=dict(
            text=title,
            font=dict(size=16, color="#38bdf8", family="Outfit, sans-serif")
        ) if title else None,
        height=height,
        autosize=True,
        margin=dict(l=35, r=35, t=55 if title else 25, b=35),
        xaxis=dict(
            gridcolor="rgba(255, 255, 255, 0.08)",
            zerolinecolor="rgba(255, 255, 255, 0.15)",
            showline=True,
            linecolor="rgba(255, 255, 255, 0.12)"
        ),
        yaxis=dict(
            gridcolor="rgba(255, 255, 255, 0.08)",
            zerolinecolor="rgba(255, 255, 255, 0.15)",
            showline=True,
            linecolor="rgba(255, 255, 255, 0.12)"
        ),
        legend=dict(
            bgcolor="rgba(15, 23, 42, 0.7)",
            bordercolor="rgba(255, 255, 255, 0.12)",
            borderwidth=1
        )
    )
    return fig

def render_glass_card(title, value, subtext="", icon="🏗️", gradient="linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)", border_color="rgba(56, 189, 248, 0.3)"):
    """Generates a responsive glassmorphic metric card HTML snippet."""
    html_code = f"""
    <div style="
        background: rgba(30, 41, 59, 0.65);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid {border_color};
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.35);
        margin-bottom: 12px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 0.8rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; font-family: 'Plus Jakarta Sans', sans-serif;">{title}</span>
            <span style="font-size: 1.4rem;">{icon}</span>
        </div>
        <div style="font-size: 1.9rem; font-weight: 800; background: {gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family: 'Outfit', sans-serif; line-height: 1.25;">
            {value}
        </div>
        {f'<div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 6px; font-weight: 500;">{subtext}</div>' if subtext else ''}
    </div>
    """
    return html_code

def predict_single_sample(sample_dict, bundle):
    """
    Predicts risk score using bundle with full DataFrame feature naming to eliminate sklearn warnings.
    """
    if bundle is None:
        return None, "Model bundle not loaded"

    df_sample = pd.DataFrame([sample_dict])
    feature_cols = bundle.get('feature_columns', [])
    encoders = bundle.get('label_encoders', {})
    scaler = bundle.get('scaler', None)
    model = bundle.get('model', None)

    for col in feature_cols:
        if col not in df_sample.columns:
            df_sample[col] = 0

    for col, enc in encoders.items():
        if col in df_sample.columns:
            val = str(df_sample[col].iloc[0])
            if hasattr(enc, 'classes_') and val in enc.classes_:
                df_sample[col] = enc.transform([val])[0]
            else:
                df_sample[col] = 0

    X = df_sample[feature_cols].copy()
    for col in X.columns:
        X[col] = pd.to_numeric(X[col], errors='coerce').fillna(0)

    if scaler is not None:
        X_scaled_np = scaler.transform(X)
        X_scaled = pd.DataFrame(X_scaled_np, columns=feature_cols)
    else:
        X_scaled = X

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        prediction = model.predict(X_scaled)[0]
        
    return prediction, None

def get_risk_level_info(score):
    """Returns risk category, CSS color, gradient, and actionable recommendation."""
    score_clean = max(0.0, min(100.0, float(score)))
    
    if score_clean < 25:
        return {
            "level": "LOW RISK",
            "color": "#10b981",
            "gradient": "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
            "bg_color": "rgba(16, 185, 129, 0.15)",
            "border_color": "rgba(16, 185, 129, 0.4)",
            "description": "Construction metrics are optimal. All operational parameters are within safe limits.",
            "action": "Maintain current operational parameters and monitor routine telemetry."
        }
    elif score_clean < 50:
        return {
            "level": "MODERATE RISK",
            "color": "#f59e0b",
            "gradient": "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
            "bg_color": "rgba(245, 158, 11, 0.15)",
            "border_color": "rgba(245, 158, 11, 0.4)",
            "description": "Minor cost deviations or equipment underutilization detected.",
            "action": "Inspect equipment utilization rates and optimize raw material allocation."
        }
    elif score_clean < 75:
        return {
            "level": "HIGH RISK",
            "color": "#ef4444",
            "gradient": "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
            "bg_color": "rgba(239, 68, 68, 0.15)",
            "border_color": "rgba(239, 68, 68, 0.4)",
            "description": "Elevated risk of cost overrun, safety incidents, or project delays.",
            "action": "Reallocate worker shift schedules, check machinery health, and resolve shortages immediately."
        }
    else:
        return {
            "level": "CRITICAL RISK",
            "color": "#f43f5e",
            "gradient": "linear-gradient(135deg, #881337 0%, #f43f5e 100%)",
            "bg_color": "rgba(244, 63, 94, 0.2)",
            "border_color": "rgba(244, 63, 94, 0.6)",
            "description": "Severe operational bottlenecks, safety hazards, or critical material shortages.",
            "action": "Halt affected site sub-operations, re-evaluate site safety protocols, and trigger emergency resource dispatch."
        }

def train_custom_models(df, target_col, selected_model_names, test_size=0.2, random_state=42):
    df_clean = df.copy().dropna()
    is_classification = df_clean[target_col].dtype == 'object' or df_clean[target_col].nunique() < 10
    
    X = df_clean.drop(columns=[target_col])
    y = df_clean[target_col]
    
    if 'timestamp' in X.columns:
        X = X.drop(columns=['timestamp'])
        
    encoders = {}
    for col in X.select_dtypes(include=['object']).columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        encoders[col] = le
        
    if is_classification and y.dtype == 'object':
        target_encoder = LabelEncoder()
        y = target_encoder.fit_transform(y)
    else:
        target_encoder = None

    scaler = StandardScaler()
    X_scaled_np = scaler.fit_transform(X)
    X_scaled = pd.DataFrame(X_scaled_np, columns=X.columns)
    
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=test_size, random_state=random_state)
    
    model_dict = {}
    if not is_classification:
        reg_models = {
            "Linear Regression": LinearRegression(),
            "Ridge Regression": Ridge(alpha=1.0),
            "Lasso Regression": Lasso(alpha=0.1),
            "Decision Tree": DecisionTreeRegressor(random_state=random_state, max_depth=10),
            "Random Forest": RandomForestRegressor(n_estimators=100, random_state=random_state, max_depth=10, n_jobs=-1),
            "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, random_state=random_state, max_depth=5),
            "Extra Trees": ExtraTreesRegressor(n_estimators=100, random_state=random_state, max_depth=10, n_jobs=-1)
        }
        for name in selected_model_names:
            if name in reg_models:
                model_dict[name] = reg_models[name]
    else:
        clf_models = {
            "Decision Tree": DecisionTreeClassifier(random_state=random_state, max_depth=10),
            "Random Forest": RandomForestClassifier(n_estimators=100, random_state=random_state, max_depth=10, n_jobs=-1),
            "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=random_state, max_depth=5),
            "Extra Trees": ExtraTreesClassifier(n_estimators=100, random_state=random_state, max_depth=10, n_jobs=-1)
        }
        for name in selected_model_names:
            if name in clf_models:
                model_dict[name] = clf_models[name]
                
    results = []
    trained_models = {}
    
    for name, model in model_dict.items():
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
        trained_models[name] = model
        
        if not is_classification:
            r2 = r2_score(y_test, preds)
            mae = mean_absolute_error(y_test, preds)
            rmse = np.sqrt(mean_squared_error(y_test, preds))
            results.append({
                "Model": name,
                "R2 Score": round(r2, 4),
                "MAE": round(mae, 4),
                "RMSE": round(rmse, 4)
            })
        else:
            acc = accuracy_score(y_test, preds)
            f1 = f1_score(y_test, preds, average='weighted')
            prec = precision_score(y_test, preds, average='weighted', zero_division=0)
            rec = recall_score(y_test, preds, average='weighted', zero_division=0)
            results.append({
                "Model": name,
                "Accuracy": round(acc, 4),
                "Precision": round(prec, 4),
                "Recall": round(rec, 4),
                "F1 Score": round(f1, 4)
            })
            
    results_df = pd.DataFrame(results)
    if not is_classification and not results_df.empty:
        results_df = results_df.sort_values(by="R2 Score", ascending=False)
    elif is_classification and not results_df.empty:
        results_df = results_df.sort_values(by="Accuracy", ascending=False)
        
    bundle = {
        "models": trained_models,
        "results_df": results_df,
        "scaler": scaler,
        "encoders": encoders,
        "target_encoder": target_encoder,
        "feature_cols": list(X.columns),
        "is_classification": is_classification,
        "X_test": X_test,
        "y_test": y_test
    }
    return bundle
