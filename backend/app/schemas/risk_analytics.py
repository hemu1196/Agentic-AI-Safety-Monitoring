from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class RiskAssessmentBase(BaseModel):
    project_id: str
    zone_id: Optional[str] = None
    risk_score: float = 0.0
    risk_level: str = "Low"
    risk_coefficient: float = 1.0
    primary_driver: Optional[str] = None
    mitigation_plan: Optional[str] = None
    recorded_at: datetime


class RiskAssessmentCreate(RiskAssessmentBase):
    pass


class RiskAssessmentResponse(RiskAssessmentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ZoneRiskSummary(BaseModel):
    zone_id: str
    zone_name: str
    risk_score: float
    risk_level: str
    active_workers: int
    open_alerts: int


class RiskAnalyticsSummaryResponse(BaseModel):
    overall_risk_score: float
    risk_level: str
    risk_coefficient: float
    primary_driver: Optional[str] = None
    zone_risks: List[ZoneRiskSummary] = []
