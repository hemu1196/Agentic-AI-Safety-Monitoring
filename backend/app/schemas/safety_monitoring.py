from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class SafetyMonitoringBase(BaseModel):
    project_id: str
    zone_id: Optional[str] = None
    safety_score: float = 100.0
    violation_count: int = 0
    inspection_date: date
    status: str = "NORMAL"
    trend_indicator: str = "stable"
    notes: Optional[str] = None


class SafetyMonitoringCreate(SafetyMonitoringBase):
    pass


class SafetyMonitoringResponse(SafetyMonitoringBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SafetySummaryResponse(BaseModel):
    overall_safety_score: float
    safety_change_percentage: Optional[str] = None
    active_violations: int
    critical_violations: int
    resolved_violations: int
    records: List[SafetyMonitoringResponse] = []
