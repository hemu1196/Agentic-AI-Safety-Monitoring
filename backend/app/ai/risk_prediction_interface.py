from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ZoneRiskAssessmentRequest(BaseModel):
    zone_id: str
    active_worker_count: int = Field(..., ge=0)
    equipment_count: int = Field(..., ge=0)
    open_violations: int = Field(..., ge=0)
    is_restricted_area: bool = False
    environmental_hazard_rating: float = Field(default=1.0, ge=0.0, le=10.0)


class ZoneRiskAssessmentResponse(BaseModel):
    zone_id: str
    risk_score: float
    risk_level: str
    risk_coefficient: float
    primary_hazard: str
    mitigation_actions: List[str]


class BaseRiskEngine(ABC):
    """
    Abstract interface for Multi-Factor Construction Risk Assessment and Safety Indexing.
    """

    @abstractmethod
    def evaluate_zone_risk(
        self, request: ZoneRiskAssessmentRequest
    ) -> ZoneRiskAssessmentResponse:
        """Calculate dynamic zone risk score based on real-time factors."""
        pass

    @abstractmethod
    def evaluate_site_risk(
        self, zone_evaluations: List[ZoneRiskAssessmentResponse]
    ) -> Dict[str, Any]:
        """Aggregate site-wide multi-zone risk indices."""
        pass


class PlaceholderRiskEngine(BaseRiskEngine):
    """
    Placeholder implementation of Risk Engine interface.
    """

    def evaluate_zone_risk(
        self, request: ZoneRiskAssessmentRequest
    ) -> ZoneRiskAssessmentResponse:
        raw_score = (
            (request.open_violations * 15.0)
            + (request.equipment_count * 3.5)
            + (request.active_worker_count * 0.8)
            + (30.0 if request.is_restricted_area else 0.0)
        )
        normalized_score = min(100.0, max(5.0, raw_score))
        
        if normalized_score >= 75:
            level = "Critical"
        elif normalized_score >= 50:
            level = "High"
        elif normalized_score >= 25:
            level = "Medium"
        else:
            level = "Low"

        return ZoneRiskAssessmentResponse(
            zone_id=request.zone_id,
            risk_score=round(normalized_score, 1),
            risk_level=level,
            risk_coefficient=round(normalized_score / 50.0, 2),
            primary_hazard="Elevated activity and machinery movement" if request.equipment_count > 2 else "Worker density",
            mitigation_actions=[
                "Deploy safety inspector to zone",
                "Ensure mandatory PPE verification at zone checkpoint"
            ]
        )

    def evaluate_site_risk(
        self, zone_evaluations: List[ZoneRiskAssessmentResponse]
    ) -> Dict[str, Any]:
        if not zone_evaluations:
            return {
                "overall_risk_score": 15.0,
                "overall_risk_level": "Low",
                "risk_coefficient": 0.8
            }
        avg_score = sum(z.risk_score for z in zone_evaluations) / len(zone_evaluations)
        return {
            "overall_risk_score": round(avg_score, 1),
            "overall_risk_level": "Medium" if avg_score > 40 else "Low",
            "risk_coefficient": round(avg_score / 50.0, 2)
        }
