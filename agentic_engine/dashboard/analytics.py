"""Safety analytics summary — matches spec section 16."""

import streamlit as st
from database import db


def render():
    st.header("Safety Risk Analytics")

    summary = db.get_analytics_summary()
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total workers seen", summary["total_workers"])
    c2.metric("Critical incidents", summary["critical_incidents"])
    c3.metric("High-risk events", summary["high_risk_events"])
    c4.metric("Avg PPE compliance", f"{summary['avg_compliance_pct']}%")

    st.subheader("Recent violations")
    rows = db.get_recent_violations(limit=25)
    if rows:
        st.table([dict(r) for r in rows])
    else:
        st.caption("No violations logged yet.")

    st.subheader("Open alerts")
    alerts = db.get_open_alerts(limit=25)
    if alerts:
        st.table([dict(r) for r in alerts])
        st.caption("Acknowledge/escalate actions can be wired to update the 'alerts' table's status column.")
    else:
        st.caption("No open alerts.")
