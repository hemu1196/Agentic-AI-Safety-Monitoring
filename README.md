AI-Powered Construction Intelligence Hub

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
# AI-Powered Construction Intelligence Hub

An AI-powered construction management platform designed for **proactive risk prediction, safety monitoring, and project analytics**.

## 🚀 Features

- 🤖 AI-based Construction Risk Prediction
- 📊 Project Analytics Dashboard
- 🦺 Safety & Hazard Monitoring
- 👷 PPE / Helmet Detection
- 📈 Risk Score Visualization
- 🔮 What-if Risk Simulation
- 🏗️ 3D Digital Twin Integration
- 📁 Batch Risk Prediction using CSV
- ⚡ Real-time Construction Intelligence

## 🧠 Machine Learning

The system evaluates multiple machine learning algorithms including:

- Linear Regression
- Ridge Regression
- Lasso Regression
- Decision Tree
- Random Forest
- Gradient Boosting
- Extra Trees

The best-performing model is selected for construction risk prediction.

## 🛠️ Technology Stack

**Frontend:** React, TypeScript, Vite  
**Backend:** Python  
**Machine Learning:** Scikit-learn  
**Computer Vision:** OpenCV  
**Visualization:** Interactive dashboards  
**3D:** Unity Digital Twin

## 🎯 Objective

The main objective of this project is to combine **Artificial Intelligence, Safety Intelligence, Data Analytics, and 3D Digital Twin technology** to support smarter and safer construction project management.

