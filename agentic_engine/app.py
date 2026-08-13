"""
Agentic AI Safety Monitoring — main entry point.

Run with:
    streamlit run app.py
"""

import streamlit as st

from database import db
from dashboard import entry_gate, live_monitor, analytics

st.set_page_config(page_title="Agentic Safety Monitor", layout="wide")
db.init_db()

PAGES = {
    "Entry Safety Gate": entry_gate,
    "Live Monitoring": live_monitor,
    "Analytics": analytics,
}

st.sidebar.title("Agentic Safety Monitor")
choice = st.sidebar.radio("Go to", list(PAGES.keys()))
st.sidebar.divider()
st.sidebar.caption(
    "PPE detection uses a color heuristic in this MVP. "
    "See README for how to upgrade to a trained hard-hat/vest model."
)

PAGES[choice].render()
