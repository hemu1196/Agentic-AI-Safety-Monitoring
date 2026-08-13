"""
Database layer — table fields match section 17 of the project spec:
workers, ppe_events, violations, alerts, shift_events, agent_actions.
"""

import sqlite3
from datetime import datetime
from pathlib import Path

import config


def get_connection():
    conn = sqlite3.connect(config.DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS workers (
            worker_id INTEGER PRIMARY KEY,
            identifier TEXT,
            entry_time TEXT,
            exit_time TEXT,
            current_status TEXT,
            photo_path TEXT
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS ppe_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            worker_id INTEGER,
            timestamp TEXT,
            helmet INTEGER,
            vest INTEGER,
            shoes INTEGER,
            gloves INTEGER,
            harness INTEGER,
            camera_id TEXT,
            photo_path TEXT
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS violations (
            violation_id INTEGER PRIMARY KEY AUTOINCREMENT,
            worker_id INTEGER,
            type TEXT,
            severity TEXT,
            timestamp TEXT,
            camera_id TEXT,
            location TEXT,
            evidence TEXT
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            alert_id INTEGER PRIMARY KEY AUTOINCREMENT,
            worker_id INTEGER,
            type TEXT,
            severity TEXT,
            timestamp TEXT,
            status TEXT DEFAULT 'open',
            acknowledged_by TEXT
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS shift_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            worker_id INTEGER,
            entry_time TEXT,
            exit_time TEXT,
            duration REAL,
            fatigue_risk TEXT
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS agent_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER,
            worker_id INTEGER,
            reasoning_summary TEXT,
            recommended_action TEXT,
            severity TEXT,
            timestamp TEXT,
            outcome TEXT
        )
    """)

    conn.commit()
    conn.close()


def upsert_worker(worker_id, status, camera_id="CAM-01", photo_path=""):
    conn = get_connection()
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    existing = conn.execute(
        "SELECT worker_id FROM workers WHERE worker_id = ?", (worker_id,)
    ).fetchone()
    if existing:
        conn.execute(
            "UPDATE workers SET current_status = ?, photo_path = ? WHERE worker_id = ?",
            (status, photo_path, worker_id),
        )
    else:
        conn.execute(
            "INSERT INTO workers (worker_id, identifier, entry_time, current_status, photo_path) "
            "VALUES (?, ?, ?, ?, ?)",
            (worker_id, f"worker_{worker_id}", now, status, photo_path),
        )
    conn.commit()
    conn.close()


def log_ppe_event(worker_id, ppe_status: dict, camera_id="CAM-01", photo_path=""):
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO ppe_events (worker_id, timestamp, helmet, vest, shoes,
                                 gloves, harness, camera_id, photo_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            worker_id, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            int(ppe_status.get("helmet", False)),
            int(ppe_status.get("vest", False)),
            int(ppe_status.get("shoes", False)),
            int(ppe_status.get("gloves", False)),
            int(ppe_status.get("harness", False)),
            camera_id,
            photo_path,
        ),
    )
    conn.commit()
    conn.close()


def log_violation(worker_id, v_type, severity, camera_id="CAM-01", location="Entry Gate", evidence=""):
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO violations (worker_id, type, severity, timestamp, camera_id, location, evidence)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (worker_id, v_type, severity, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"), camera_id, location, evidence),
    )
    conn.commit()
    conn.close()


def log_alert(worker_id, v_type, severity):
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO alerts (worker_id, type, severity, timestamp, status)
        VALUES (?, ?, ?, ?, 'open')
        """,
        (worker_id, v_type, severity, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")),
    )
    conn.commit()
    conn.close()


def log_agent_action(worker_id, reasoning, action, severity, event_id=None):
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO agent_actions (event_id, worker_id, reasoning_summary,
                                   recommended_action, severity, timestamp, outcome)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
        """,
        (
            event_id, worker_id, reasoning, action, severity,
            datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        ),
    )
    conn.commit()
    conn.close()
