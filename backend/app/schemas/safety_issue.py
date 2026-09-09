from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class SafetyIssueBase(BaseModel):
    project_id: str
    zone_id: Optional[str] = None
    title: str
    category: str
    description: str
    severity: str = "Warning"
    status: str = "Active"
    evidence_file_url: Optional[str] = None
    evidence_metadata: Optional[Dict[str, Any]] = None


class SafetyIssueCreate(SafetyIssueBase):
    reporter_id: Optional[str] = None


class SafetyIssueUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    zone_id: Optional[str] = None
    evidence_file_url: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None


class SafetyIssueResponse(SafetyIssueBase):
    id: str
    reporter_id: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
