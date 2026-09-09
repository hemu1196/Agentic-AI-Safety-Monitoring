from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class ReportBase(BaseModel):
    project_id: str
    title: str
    type: str = "DAILY_SAFETY"
    summary: str
    details: Optional[Dict[str, Any]] = None
    file_url: Optional[str] = None
    status: str = "GENERATED"


class ReportCreate(ReportBase):
    author_id: Optional[str] = None


class ReportUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    file_url: Optional[str] = None
    status: Optional[str] = None


class ReportResponse(ReportBase):
    id: str
    author_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
