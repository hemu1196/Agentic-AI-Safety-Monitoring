import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from utils import compute_insurance_compliance_score, render_glass_card, apply_plotly_theme

def render_insurance_compliance_page(df, bundle):
    st.markdown("""
    <div style="margin-bottom: 20px;">
        <h2 style="font-family: 'Outfit', sans-serif; font-weight: 700; color: #f8fafc; margin: 0;">📜 Milestone 3: Compliance & Insurance Intelligence</h2>
        <p style="color: #94a3b8; font-size: 0.95rem;">OSHA / ISO 45001 Regulatory Compliance Index, Underwriting Risk Ratings & Automated Audit Exporter.</p>
    </div>
    """, unsafe_allow_html=True)
    
    if df is None:
        st.warning("Dataset unavailable.")
        return

    st.markdown("### 📋 Site Audit & Policy Input Metrics")
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        site_risk = st.slider("Project Risk Score", 0.0, 100.0, 38.0, key="i_risk")
    with c2:
        incidents = st.number_input("Safety Incidents", 0, 10, 0, key="i_incidents")
    with c3:
        shortage = st.selectbox("Shortage Alert", [0, 1], index=0, format_func=lambda x: "No Shortage (0)" if x == 0 else "Shortage Alert (1)", key="i_shortage")
    with c4:
        cost_dev = st.number_input("Cost Deviation ($)", -2000.0, 20000.0, 1500.0, key="i_cost_dev")

    # Compute Insurance & Compliance Scores
    ins_info = compute_insurance_compliance_score(site_risk, incidents, shortage, cost_dev, 0.0)

    # Glass Cards
    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown(render_glass_card(
            "OSHA/ISO Compliance Index", f"{ins_info['compliance_pct']}%",
            "Target Compliance: >80%", "📜",
            "linear-gradient(135deg, #10b981 0%, #34d399 100%)" if ins_info['compliance_pct'] >= 80 else "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
        ), unsafe_allow_html=True)

    with k2:
        st.markdown(render_glass_card(
            "Underwriting Risk Grade", f"Grade {ins_info['underwriting_grade']}",
            ins_info['risk_category'], "🏛️",
            "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)"
        ), unsafe_allow_html=True)

    with k3:
        st.markdown(render_glass_card(
            "Premium Rate Adjustment", ins_info['premium_multiplier'],
            "Underwriter Rate Factor", "💳",
            "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
        ), unsafe_allow_html=True)

    with k4:
        st.markdown(render_glass_card(
            "Claims Severity Index", f"{ins_info['claims_severity_index']}",
            "Expected Claims Exposure", "📊",
            "linear-gradient(135deg, #c084fc 0%, #e879f9 100%)"
        ), unsafe_allow_html=True)

    st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)
    st.markdown("### 📄 Automated Executive Compliance & Insurance Audit Report")

    # Generate Audit Report Text
    report_text = f"""===================================================================
CONSTRUCTION INTELLIGENCE HUB — COMPLIANCE & INSURANCE AUDIT REPORT
===================================================================
Audit Date: 2026-08-05
Regulatory Target Standards: OSHA 1926 & ISO 45001 Compliance Proxy

1. EXECUTIVE RISK & UNDERWRITING RATINGS
-------------------------------------------------------------------
- Overall Regulatory Compliance Index: {ins_info['compliance_pct']}%
- Insurance Underwriting Risk Grade: Grade {ins_info['underwriting_grade']} ({ins_info['risk_category']})
- Policy Premium Rate Adjustment: {ins_info['premium_multiplier']}
- Projected Claims Severity Exposure Index: {ins_info['claims_severity_index']}

2. SITE AUDIT METRICS
-------------------------------------------------------------------
- Current Project Risk Score: {site_risk:.1f} / 100.0
- Logged Safety Incidents: {incidents}
- Material Shortage Alert Status: {'ACTIVE SHORTAGE' if shortage == 1 else 'NORMAL'}
- Total Budget Deviation: ${cost_dev:,.2f}

3. UNDERWRITER ACTIONABLE DIRECTIVES
-------------------------------------------------------------------
* Maintaining high compliance above 85% qualifies site for preferred premium discount.
* Keep safety incidents at zero to avoid automatic 12% compliance rating penalty.
* Regular site telemetry logs satisfy digital audit trail requirements.
==================================================================="""

    st.text_area("Audit Report Preview", report_text, height=260)

    # Download Button for Audit Report
    st.download_button(
        label="📥 Download Executive Compliance Audit Report (TXT)",
        data=report_text.encode('utf-8'),
        file_name="Construction_Compliance_Insurance_Audit_Report.txt",
        mime="text/plain",
        type="primary",
        use_container_width=True
    )
