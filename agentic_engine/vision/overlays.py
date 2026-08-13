"""
Overlay drawing — matches the video interface examples in the spec:
green box + 'SAFE' for compliant workers, red box + violation text for
non-compliant workers.
"""

import cv2

GREEN = (60, 180, 75)   # BGR
RED = (40, 40, 220)     # BGR
WHITE = (255, 255, 255)


def draw_worker_box(frame, box, track_id, ppe_status, decision, missing_items):
    x1, y1, x2, y2 = [int(v) for v in box]
    color = GREEN if decision == "PASS" else RED
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

    label_id = f"Worker #{track_id}" if track_id is not None else "Worker"
    ppe_line = " ".join(
        f"{item.upper()}:{'Y' if present else 'N'}"
        for item, present in ppe_status.items()
    )
    status_line = "SAFE" if decision == "PASS" else f"MISSING {', '.join(missing_items).upper()}"

    _draw_label_block(frame, x1, y1, [label_id, ppe_line, status_line], color)
    return frame


def _draw_label_block(frame, x, y, lines, color):
    font = cv2.FONT_HERSHEY_SIMPLEX
    scale = 0.5
    thickness = 1
    pad = 4
    line_h = 18

    box_h = line_h * len(lines) + pad * 2
    max_w = max(cv2.getTextSize(line, font, scale, thickness)[0][0] for line in lines) + pad * 2

    top = max(y - box_h, 0)
    cv2.rectangle(frame, (x, top), (x + max_w, top + box_h), color, -1)

    for i, line in enumerate(lines):
        text_y = top + pad + line_h * i + 14
        cv2.putText(frame, line, (x + pad, text_y), font, scale, WHITE, thickness, cv2.LINE_AA)


def draw_gate_banner(frame, decision, missing_items):
    """Big banner across the top of the frame: ENTRY ALLOWED / ENTRY BLOCKED."""
    h, w = frame.shape[:2]
    banner_h = 60
    color = GREEN if decision == "PASS" else RED
    cv2.rectangle(frame, (0, 0), (w, banner_h), color, -1)

    if decision == "PASS":
        text = "ENTRY ALLOWED"
    else:
        text = f"ENTRY BLOCKED — WEAR {', '.join(missing_items).upper()}"

    font = cv2.FONT_HERSHEY_SIMPLEX
    scale = 1.0
    thickness = 2
    text_size = cv2.getTextSize(text, font, scale, thickness)[0]
    text_x = max((w - text_size[0]) // 2, 10)
    cv2.putText(frame, text, (text_x, 40), font, scale, WHITE, thickness, cv2.LINE_AA)
    return frame
