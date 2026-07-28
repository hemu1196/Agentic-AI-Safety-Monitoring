import os
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
        df = pd.read_csv(DATA_PATH)
        return df
    return None

@st.cache_resource
def load_model_bundle():
    if os.path.exists(MODEL_PATH):
        try:
            bundle = joblib.load(MODEL_PATH)
            return bundle
        except Exception as e:
            st.error(f"Error loading model bundle: {e}")
            return None
    return None

def predict_single_sample(sample_dict, bundle):
    """
    Takes a dictionary of feature values and predicts the risk score / target using bundle.
    """
    if bundle is None:
        return None, "Model bundle not loaded"

    df_sample = pd.DataFrame([sample_dict])
    feature_cols = bundle.get('feature_columns', [])
    encoders = bundle.get('label_encoders', {})
    scaler = bundle.get('scaler', None)
    model = bundle.get('model', None)

    # Ensure all feature columns exist
    for col in feature_cols:
        if col not in df_sample.columns:
            df_sample[col] = 0

    # Encode categorical columns
    for col, enc in encoders.items():
        if col in df_sample.columns:
            val = str(df_sample[col].iloc[0])
            if hasattr(enc, 'classes_') and val in enc.classes_:
                df_sample[col] = enc.transform([val])[0]
            else:
                df_sample[col] = 0

    # Ensure numeric order
    X = df_sample[feature_cols].copy()
    for col in X.columns:
        X[col] = pd.to_numeric(X[col], errors='coerce').fillna(0)

    if scaler is not None:
        X_scaled_np = scaler.transform(X)
        X_scaled = pd.DataFrame(X_scaled_np, columns=feature_cols)
    else:
        X_scaled = X

    prediction = model.predict(X_scaled)[0]
    return prediction, None

def get_risk_level_info(score):
    """Returns risk category, CSS color, and actionable recommendation."""
    if score < 25:
        return {
            "level": "LOW RISK",
            "color": "#10b981", # Green
            "badge_class": "badge-success",
            "description": "Construction metrics are optimal. Project running smoothly.",
            "action": "Maintain current operational parameters and monitor routine telemetry."
        }
    elif score < 50:
        return {
            "level": "MODERATE RISK",
            "color": "#f59e0b", # Orange
            "badge_class": "badge-warning",
            "description": "Minor deviations in cost, equipment, or material usage detected.",
            "action": "Inspect equipment utilization rates and optimize raw material allocation."
        }
    elif score < 75:
        return {
            "level": "HIGH RISK",
            "color": "#ef4444", # Red
            "badge_class": "badge-danger",
            "description": "Significant risk of cost overrun, safety incidents, or project delays.",
            "action": "Reallocate worker shift schedules, check machinery health, and resolve shortages immediately."
        }
    else:
        return {
            "level": "CRITICAL RISK",
            "color": "#881337", # Dark red
            "badge_class": "badge-critical",
            "description": "Severe operational bottlenecks, high safety incidents, or critical material shortages.",
            "action": "Halt affected site sub-operations, re-evaluate site safety protocols, and trigger emergency resource dispatch."
        }

def train_custom_models(df, target_col, selected_model_names, test_size=0.2, random_state=42):
    """
    Trains selected ML models on df for target_col and returns results dataframe + trained models.
    """
    df_clean = df.copy().dropna()
    
    # Determine problem type
    is_classification = df_clean[target_col].dtype == 'object' or df_clean[target_col].nunique() < 10
    
    X = df_clean.drop(columns=[target_col])
    y = df_clean[target_col]
    
    # Handle timestamp if present
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
