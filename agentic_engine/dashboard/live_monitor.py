"""
Live Site Monitoring — matches spec section 6 / Video Interface Example C.
Shows the camera feed plus a running site status panel (worker counts,
PPE compliance, open alerts).
"""

import time
import cv2
import streamlit as st

import config
from vision.detector import PersonPPEDetector
from vision.overlays import draw_worker_box
from safety.ppe_rules import evaluate_ppe
from agent.action_router import route_all
from database import db


@st.cache_resource
def get_detector():
    return PersonPPEDetector()


def render():
    st.header("Live Site Monitoring — CAM-01")

    run = st.checkbox("Start Camera", key="monitor_run")
    col_video, col_stats = st.columns([2, 1])
    frame_placeholder = col_video.empty()
    stats_placeholder = col_stats.empty()
    alerts_placeholder = st.empty()

    if not run:
        st.info("Tick 'Start Camera' to begin.")
        return

    detector = get_detector()
    cap = cv2.VideoCapture(config.CAMERA_INDEX)
    if not cap.isOpened():
        st.error("Could not open webcam.")
        return

    repeat_counts = {}

    try:
        while run:
            ret, frame = cap.read()
            if not ret:
                st.error("Failed to read frame.")
                break

            people = detector.detect_and_track(frame)
            safe_count = 0
            warning_count = 0
            critical_count = 0

            for person in people:
                worker_id = person["track_id"]
                box = person["box"]
                ppe_status = detector.check_ppe(frame, box)
                result = evaluate_ppe(ppe_status)

                draw_worker_box(frame, box, worker_id, ppe_status,
                                 result["decision"], result["missing_items"])

                if result["decision"] == "PASS":
                    safe_count += 1
                else:
                    critical_count += 1 if "critical" in [
                        v["severity"] for v in result["violations"]] else 0
                    warning_count += 1

                if worker_id is not None:
                    db.upsert_worker(worker_id, result["decision"])
                    for v in result["violations"]:
                        key = (worker_id, v["type"])
                        repeat_counts[key] = repeat_counts.get(key, 0) + 1
                        db.log_violation(worker_id, v["type"], v["severity"])
                    decisions = route_all(
                        worker_id, result["violations"],
                        repeat_counts={v["type"]: repeat_counts[(worker_id, v["type"])]
                                       for v in result["violations"]},
                    )
                    for d in decisions:
                        db.log_alert(worker_id, d.event_type, d.severity)

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame_placeholder.image(frame_rgb, channels="RGB")

            with stats_placeholder.container():
                st.metric("Workers in frame", len(people))
                st.metric("Safe", safe_count)
                st.metric("Warnings", warning_count)
                st.metric("Critical", critical_count)

            with alerts_placeholder.container():
                st.subheader("Open alerts")
                rows = db.get_open_alerts(limit=8)
                if rows:
                    st.table([dict(r) for r in rows])
                else:
                    st.caption("No open alerts.")

            time.sleep(0.03)
    finally:
        cap.release()
