# Agentic AI Safety Monitoring — MVP

This matches the MVP scope from the project doc: person detection + tracking,
PPE (helmet/vest) checking, Entry Safety Gate with PASS/BLOCK, green/red
worker overlays, SQLite violation/alert logging, and a basic agentic
decision layer.

## Why your earlier version only showed generic "Person" boxes

The stock YOLO model (`yolov8n.pt`) is trained on COCO, which has classes
like `person`, `car`, `traffic light` — but **no `helmet` or `vest` class at
all**. There is no way to get PPE-specific detection out of that model no
matter how it's configured. That's why you were only seeing plain person
boxes and generic zone alerts.

## How this version gets PPE detection working today

Rather than requiring you to source and train a custom model before you can
see anything working, `vision/detector.py` estimates helmet/vest presence
with a **color heuristic**: it looks at the top ~28% of each detected
person's box (head) and the next ~42% (torso), converts to HSV, and checks
whether enough pixels match typical high-visibility PPE colors (yellow,
white, orange hard hats; orange/yellow-green hi-vis vests).

This works reasonably well because site-mandated PPE is deliberately bright
and high-contrast — that's *why* it's colored that way. It is not as
accurate as a trained model and can be fooled by other yellow/orange objects
in frame, but it gets your Entry Gate PASS/BLOCK, green/red boxes, and
violation logging genuinely working right now, with zero extra downloads.

Tune the color ranges in `config.py` (`HELMET_HSV_RANGES`,
`VEST_HSV_RANGES`, `*_MATCH_RATIO`) to match your actual PPE and lighting —
this is the single most important calibration step.

## Upgrading to a trained PPE model (recommended next step)

For real accuracy, replace the heuristic with a YOLO model fine-tuned on a
hard-hat/vest dataset:

1. Find or build a labeled dataset (Roboflow Universe has several public
   "hard hat detection" / "construction PPE" datasets you can export in
   YOLO format).
2. Fine-tune a YOLOv8 model on it (`yolo train data=ppe.yaml model=yolov8n.pt`).
3. In `vision/detector.py`, load that model alongside the person model, run
   it on the same frame, and match its `helmet`/`vest`/`no_helmet`/`no_vest`
   boxes to person boxes by IoU instead of using `check_ppe()`'s color logic.
4. Everything downstream (rules, agent, database, dashboards) stays the same
   — they only care about the resulting `{"helmet": bool, "vest": bool}`.

## Project structure

```
agentic_safety/
  app.py                 # Streamlit entry point, page navigation
  config.py               # camera, model, color thresholds, policy
  requirements.txt
  vision/
    detector.py           # YOLO person detection+tracking, PPE color heuristic
    overlays.py            # green/red box drawing, entry gate banner
  safety/
    ppe_rules.py           # PASS/BLOCK decision, compliance %, violations
  agent/
    action_router.py       # agentic decision layer: severity, escalation, action
  database/
    db.py                   # SQLite schema + queries (workers, ppe_events,
                             # violations, alerts, shift_events, agent_actions)
  dashboard/
    entry_gate.py            # Video Interface Example A/B — PASS/BLOCK gate
    live_monitor.py           # Video Interface Example C — site overview
    analytics.py               # Section 16 — compliance %, incident counts
```

## Setup

```bash
pip install -r requirements.txt
```

## Run

```bash
streamlit run app.py
```

Use the sidebar to switch between **Entry Safety Gate**, **Live Monitoring**,
and **Analytics**. Tick "Start Camera" on either video page.

## Testing it

- Stand in frame with a bright yellow/white/orange hard hat and a hi-vis
  vest → should show a **green box** and **PASS / ENTRY ALLOWED**.
- Remove the hard hat (or use a plain-colored hat) → should show a **red
  box** and **BLOCK / ENTRY BLOCKED — WEAR HELMET**.
- Check `safety_events.db` (any SQLite viewer) — you'll see rows appear in
  `workers`, `ppe_events`, `violations`, `alerts`, and `agent_actions` as you
  test.

## What's intentionally NOT built yet (per the roadmap)

Restricted zones, fall detection, fatigue/inactivity analytics, and
multi-camera/drone support are all in the spec's later phases (10-12) — this
MVP focuses on phases 1-8 (person + PPE detection, tracking, entry gate,
rules, dashboard, database, agentic events) so you have something real to
demo before adding more.
