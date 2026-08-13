"""
Central configuration for the Agentic Safety Monitoring MVP.
Tune these values to match your actual camera, lighting, and site policy.
"""

# --- Camera ---
CAMERA_INDEX = 0

# --- Detection model ---
# yolov8n.pt only knows COCO classes (person, car, ...). It does NOT know
# "helmet" or "vest" — there is no COCO class for PPE. So PPE presence is
# estimated with a color heuristic on sub-regions of each person box below.
# For production accuracy, replace this heuristic with a YOLO model
# fine-tuned on a hard-hat/vest dataset (see README "Upgrading PPE
# detection"), and swap check_ppe() in vision/detector.py accordingly.
PERSON_MODEL_PATH = "yolov8n.pt"
PERSON_CONF_THRESHOLD = 0.5
TRACKER_CFG = "bytetrack.yaml"

# --- PPE color heuristic ---
# HSV ranges (OpenCV: H 0-179, S 0-255, V 0-255) for common high-visibility
# PPE colors. Tune these to your actual helmet/vest colors on site.
HELMET_HSV_RANGES = [
    # (name, lower, upper)
    ("yellow_white_hat", (18, 60, 120), (35, 255, 255)),
    ("white_hat", (0, 0, 180), (179, 40, 255)),
    ("orange_hat", (5, 100, 120), (18, 255, 255)),
    ("blue_hat", (95, 80, 80), (130, 255, 255)),
]
VEST_HSV_RANGES = [
    ("hi_vis_orange", (5, 120, 120), (18, 255, 255)),
    ("hi_vis_yellow_green", (25, 100, 100), (45, 255, 255)),
]

# Fraction of pixels in the region that must match a PPE color for it to
# count as "present". Lower = more sensitive (more false positives).
HELMET_MATCH_RATIO = 0.12
VEST_MATCH_RATIO = 0.10

# Region of the person box used to look for each item (fraction of box height)
HEAD_REGION = (0.0, 0.28)     # top 28% of the box = head
TORSO_REGION = (0.28, 0.70)   # next 42% = torso

# --- Entry gate policy ---
# Which PPE items are mandatory for entry. Extend with "shoes", "gloves",
# "harness" once you add detectors for them.
REQUIRED_PPE = ["helmet", "vest"]

# --- Severity table (mirrors the project spec's Safety Rule Engine) ---
SEVERITY_TABLE = {
    "no_helmet": "high",
    "no_vest": "high",
    "restricted_zone": "critical",
}

RECOMMENDED_ACTION = {
    "no_helmet": "Block entry and notify safety lead.",
    "no_vest": "Block entry and log violation.",
    "restricted_zone": "Alert supervisor and record incident.",
}

DB_PATH = "safety_events.db"
