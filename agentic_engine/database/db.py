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
            current_status TEXT
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
            camera_id TEXT
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


def upsert_worker(worker_id, status, camera_id="CAM-01"):
    conn = get_connection()
    now = datetime.utcnow().isoformat()
    existing = conn.execute(
        "SELECT worker_id FROM workers WHERE worker_id = ?", (worker_id,)
    ).fetchone()
    if existing:
        conn.execute(
            "UPDATE workers SET current_status = ? WHERE worker_id = ?",
            (status, worker_id),
        )
    else:
        conn.execute(
            "INSERT INTO workers (worker_id, identifier, entry_time, current_status) "
            "VALUES (?, ?, ?, ?)",
            (worker_id, f"Worker #{worker_id}", now, status),
        )
    conn.commit()
    conn.close()


def log_ppe_event(worker_id, ppe_status: dict, camera_id="CAM-01"):
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO ppe_events (worker_id, timestamp, helmet, vest, shoes,
                                 gloves, harness, camera_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            worker_id, datetime.utcnow().isoformat(),
            int(ppe_status.get("helmet", False)),
            int(ppe_status.get("vest", False)),
            int(ppe_status.get("shoes", False)),
            int(ppe_status.get("gloves", False)),
            int(ppe_status.get("harness", False)),
            camera_id,
        ),
    )
    conn.commit()
    conn.close()


def log_violation(worker_id, v_type, severity, camera_id="CAM-01", location="Entry Gate"):
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO violations (worker_id, type, severity, timestamp, camera_id, location)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (worker_id, v_type, severity, datetime.utcnow().isoformat(), camera_id, location),
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
        (worker_id, v_type, severity, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()


def log_agent_action(worker_id, reasoning, action, severity):
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO agent_actions (worker_id, reasoning_summary, recommended_action,
                                    severity, timestamp, outcome)
        VALUES (?, ?, ?, ?, ?, 'pending')
        """,
        (worker_id, reasoning, action, severity, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()


def acknowledge_alert(alert_id, acknowledged_by="supervisor"):
    conn = get_connection()
    conn.execute(
        "UPDATE alerts SET status = 'acknowledged', acknowledged_by = ? WHERE alert_id = ?",
        (acknowledged_by, alert_id),
    )
    conn.commit()
    conn.close()


def get_open_alerts(limit=20):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM alerts WHERE status = 'open' ORDER BY alert_id DESC LIMIT ?",
        (limit,),
    ).fetchall()
    conn.close()
    return rows


def get_recent_violations(limit=20):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM violations ORDER BY violation_id DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return rows


def get_analytics_summary():
    conn = get_connection()
    total_workers = conn.execute("SELECT COUNT(*) c FROM workers").fetchone()["c"]
    critical = conn.execute(
        "SELECT COUNT(*) c FROM violations WHERE severity = 'critical'"
    ).fetchone()["c"]
    high = conn.execute(
        "SELECT COUNT(*) c FROM violations WHERE severity = 'high'"
    ).fetchone()["c"]
    avg_compliance_row = conn.execute(
        "SELECT AVG(helmet + vest) * 50 AS avg_c FROM ppe_events"
    ).fetchone()
    avg_compliance = round(avg_compliance_row["avg_c"], 1) if avg_compliance_row["avg_c"] else 0
    conn.close()
    return {
        "total_workers": total_workers,
        "critical_incidents": critical,
        "high_risk_events": high,
        "avg_compliance_pct": avg_compliance,
    }
