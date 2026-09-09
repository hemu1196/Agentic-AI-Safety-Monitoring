from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float
    confidence: float
    label: str


class PPEInspectionResult(BaseModel):
    has_helmet: bool
    has_vest: bool
    has_shoes: bool
    has_gloves: bool
    has_badge: bool
    overall_compliance_score: float
    detections: List[BoundingBox] = []


class HazardDetectionResult(BaseModel):
    hazard_detected: bool
    hazard_type: Optional[str] = None
    severity: str
    confidence: float
    bounding_boxes: List[BoundingBox] = []


class BaseComputerVisionEngine(ABC):
    """
    Abstract interface for Edge / Cloud Computer Vision safety feeds and CCTV frames.
    """

    @abstractmethod
    def inspect_worker_ppe(self, image_bytes: bytes) -> PPEInspectionResult:
        """Inspect a captured gate/checkpoint camera frame for PPE compliance."""
        pass

    @abstractmethod
    def detect_zone_hazards(self, frame_bytes: bytes) -> HazardDetectionResult:
        """Detect safety violations (e.g. lack of harness, restricted intrusion)."""
        pass


class PlaceholderComputerVisionEngine(BaseComputerVisionEngine):
    """
    Stub placeholder interface implementation before YOLO / OpenCV model weights integration.
    """

    def inspect_worker_ppe(self, image_bytes: bytes) -> PPEInspectionResult:
        # Default placeholder safe response
        return PPEInspectionResult(
            has_helmet=True,
            has_vest=True,
            has_shoes=True,
            has_gloves=True,
            has_badge=True,
            overall_compliance_score=100.0,
            detections=[]
        )

    def detect_zone_hazards(self, frame_bytes: bytes) -> HazardDetectionResult:
        return HazardDetectionResult(
            hazard_detected=False,
            hazard_type=None,
            severity="None",
            confidence=0.98,
            bounding_boxes=[]
        )
