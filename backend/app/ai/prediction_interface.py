from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ProjectDelayPredictionRequest(BaseModel):
    project_id: str
    current_progress: float = Field(..., ge=0, le=100)
    planned_progress: float = Field(..., ge=0, le=100)
    active_worker_count: int = Field(..., ge=0)
    open_violations_count: int = Field(..., ge=0)
    weather_impact_severity: str = Field(default="Low")
    material_shortage_flag: bool = Field(default=False)


class ProjectDelayPredictionResponse(BaseModel):
    predicted_delay_days: int
    probability_percentage: float
    delay_driver: str
    severity: str
    recommendations: List[str]
    confidence_score: float


class BasePredictionEngine(ABC):
    """
    Abstract interface defining methods for predictive analytics in construction operations.
    Real AI/ML models (e.g. Scikit-learn, XGBoost, TensorFlow, PyTorch) will implement this interface.
    """

    @abstractmethod
    def predict_project_delay(
        self, request: ProjectDelayPredictionRequest
    ) -> ProjectDelayPredictionResponse:
        """Predict project timeline delay and primary risk drivers."""
        pass

    @abstractmethod
    def predict_safety_score_trend(
        self, historical_scores: List[float], violation_counts: List[int]
    ) -> Dict[str, Any]:
        """Predict upcoming week safety score forecast."""
        pass


class PlaceholderPredictionEngine(BasePredictionEngine):
    """
    Mock/Stub placeholder for Prediction Engine prior to actual ML model deployment.
    """

    def predict_project_delay(
        self, request: ProjectDelayPredictionRequest
    ) -> ProjectDelayPredictionResponse:
        gap = max(0.0, request.planned_progress - request.current_progress)
        predicted_days = int(gap // 5)
        prob = min(95.0, max(20.0, gap * 4.0))
        driver = "Workforce allocation" if request.active_worker_count < 10 else "Weather and logistics"
        
        return ProjectDelayPredictionResponse(
            predicted_delay_days=predicted_days,
            probability_percentage=prob,
            delay_driver=driver,
            severity="Medium" if predicted_days > 3 else "Low",
            recommendations=[
                "Optimize critical path tasks",
                "Reassign secondary zone workforce to bottleneck areas"
            ],
            confidence_score=0.85
        )

    def predict_safety_score_trend(
        self, historical_scores: List[float], violation_counts: List[int]
    ) -> Dict[str, Any]:
        avg_score = sum(historical_scores) / len(historical_scores) if historical_scores else 90.0
        return {
            "forecast_next_period_score": round(avg_score, 1),
            "trend": "improving" if avg_score > 85 else "stable",
            "model_version": "placeholder-v1.0"
        }
