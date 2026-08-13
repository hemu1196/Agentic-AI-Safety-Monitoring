"""
Entry Safety Gate — matches spec section 4-5 / Video Interface Examples A & B.
A worker approaches the camera; the system checks PPE and shows PASS/BLOCK.
"""

import time
import cv2
import streamlit as st

import config
from vision.detector import PersonPPEDetector
from vision.overlays import draw_worker_box, draw_gate_banner
from safety.ppe_rules import evaluate_ppe
from agent.action_router import route_all
from database import db


@st.cache_resource
def get_detector():
    return PersonPPEDetector()


def render():
    st.header("Entry Safety Gate — CAM-01")
    st.caption(
        "PPE is estimated from color (bright hard-hat / hi-vis vest colors). "
        "Wear a clearly colored helmet and vest to test PASS; remove one to "
        "test BLOCK. See README for upgrading to a trained PPE model."
    )

    run = st.checkbox("Start Camera", key="gate_run")
    frame_placeholder = st.empty()
    detail_placeholder = st.empty()

    if not run:
        st.info("Tick 'Start Camera' to begin.")
        return

    detector = get_detector()
    cap = cv2.VideoCapture(config.CAMERA_INDEX)
    if not cap.isOpened():
        st.error("Could not open webcam.")
        return

    repeat_counts = {}  # (worker_id, violation_type) -> count, session-local

    try:
        while run:
            ret, frame = cap.read()
            if not ret:
                st.error("Failed to read frame.")
                break

            people = detector.detect_and_track(frame)

            gate_decision = "PASS"
            gate_missing = []
            detail_rows = []

            for person in people:
                worker_id = person["track_id"]
                box = person["box"]
                ppe_status = detector.check_ppe(frame, box)
                result = evaluate_ppe(ppe_status)

                draw_worker_box(frame, box, worker_id, ppe_status,
                                 result["decision"], result["missing_items"])

                if worker_id is not None:
                    db.upsert_worker(worker_id, result["decision"])
                    db.log_ppe_event(worker_id, ppe_status)

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
                        db.log_agent_action(worker_id, d.reasoning_summary,
                                             d.recommended_action, d.severity)

                detail_rows.append({
                    "Worker": f"#{worker_id}" if worker_id is not None else "?",
                    "Helmet": "Y" if ppe_status["helmet"] else "N",
                    "Vest": "Y" if ppe_status["vest"] else "N",
                    "Decision": result["decision"],
                    "Compliance %": result["compliance_pct"],
                })

                # Gate reflects the most-recently-seen non-compliant worker
                if result["decision"] == "BLOCK":
                    gate_decision = "BLOCK"
                    gate_missing = result["missing_items"]

            draw_gate_banner(frame, gate_decision, gate_missing)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frame_placeholder.image(frame_rgb, channels="RGB")

            with detail_placeholder.container():
                if detail_rows:
                    st.table(detail_rows)
                else:
                    st.caption("No workers detected in frame.")

            time.sleep(0.03)
    finally:
        cap.release()
