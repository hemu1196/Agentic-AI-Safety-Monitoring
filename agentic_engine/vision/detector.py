"""
Detection layer.

- Person detection + tracking: YOLOv8 (COCO 'person' class) + ByteTrack.
- PPE presence (helmet, vest): color-based heuristic over sub-regions of
  each person box. This is a pragmatic MVP approach that requires no
  custom-trained model and works reasonably well when PPE is high-visibility
  colored (which most site-mandated PPE is, by design).

To upgrade later: replace check_ppe() with inference from a YOLO model
fine-tuned on a hard-hat/vest dataset, and merge its boxes with the person
boxes by IoU instead of using color regions.
"""

import cv2
import numpy as np
from ultralytics import YOLO

import config

PERSON_CLASS_ID = 0  # COCO class id for "person"


class PersonPPEDetector:
    def __init__(self):
        self.model = YOLO(config.PERSON_MODEL_PATH)

    def detect_and_track(self, frame):
        """Runs person detection + tracking on a frame.

        Returns a list of dicts: {track_id, box (x1,y1,x2,y2), conf}
        """
        results = self.model.track(
            frame,
            persist=True,
            tracker=config.TRACKER_CFG,
            conf=config.PERSON_CONF_THRESHOLD,
            classes=[PERSON_CLASS_ID],
            verbose=False,
        )[0]

        people = []
        if results.boxes is not None:
            for box in results.boxes:
                track_id = int(box.id[0]) if box.id is not None else None
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                people.append({
                    "track_id": track_id,
                    "box": (x1, y1, x2, y2),
                    "conf": conf,
                })
        return people

    def check_ppe(self, frame, box):
        """Estimates helmet/vest presence using color heuristics.

        Returns {"helmet": bool, "vest": bool}
        """
        x1, y1, x2, y2 = [int(v) for v in box]
        x1, y1 = max(x1, 0), max(y1, 0)
        x2 = min(x2, frame.shape[1])
        y2 = min(y2, frame.shape[0])
        if x2 <= x1 or y2 <= y1:
            return {"helmet": False, "vest": False}

        person_crop = frame[y1:y2, x1:x2]
        h = person_crop.shape[0]

        head_top, head_bot = config.HEAD_REGION
        torso_top, torso_bot = config.TORSO_REGION
        head_region = person_crop[int(h * head_top):int(h * head_bot), :]
        torso_region = person_crop[int(h * torso_top):int(h * torso_bot), :]

        helmet_present = self._region_matches_colors(
            head_region, config.HELMET_HSV_RANGES, config.HELMET_MATCH_RATIO
        )
        vest_present = self._region_matches_colors(
            torso_region, config.VEST_HSV_RANGES, config.VEST_MATCH_RATIO
        )
        return {"helmet": helmet_present, "vest": vest_present}

    @staticmethod
    def _region_matches_colors(region, hsv_ranges, match_ratio):
        if region.size == 0:
            return False
        hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
        total_pixels = hsv.shape[0] * hsv.shape[1]
        if total_pixels == 0:
            return False

        combined_mask = np.zeros(hsv.shape[:2], dtype=np.uint8)
        for _, lower, upper in hsv_ranges:
            mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            combined_mask = cv2.bitwise_or(combined_mask, mask)

        match_fraction = float(np.count_nonzero(combined_mask)) / total_pixels
        return match_fraction >= match_ratio
