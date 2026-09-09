"""AI & Machine Learning Interfaces Package"""
from app.ai.prediction_interface import BasePredictionEngine, ProjectDelayPredictionRequest, ProjectDelayPredictionResponse
from app.ai.risk_prediction_interface import BaseRiskEngine, ZoneRiskAssessmentRequest, ZoneRiskAssessmentResponse
from app.ai.computer_vision_interface import BaseComputerVisionEngine, PPEInspectionResult, HazardDetectionResult

__all__ = [
    "BasePredictionEngine",
    "ProjectDelayPredictionRequest",
    "ProjectDelayPredictionResponse",
    "BaseRiskEngine",
    "ZoneRiskAssessmentRequest",
    "ZoneRiskAssessmentResponse",
    "BaseComputerVisionEngine",
    "PPEInspectionResult",
    "HazardDetectionResult",
]
