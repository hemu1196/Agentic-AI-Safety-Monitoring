from datetime import date, datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class PPERequirements(BaseModel):
    helmet: bool = True
    vest: bool = True
    shoes: bool = True
    gloves: bool = True
    badge: bool = True


class WorkerBase(BaseModel):
    worker_code: str
    name: str
    role: str = "Worker"
    phone: Optional[str] = None
    email: Optional[str] = None
    assigned_project_id: Optional[str] = None
    assigned_zone_id: Optional[str] = None
    status: str = "ACTIVE"
    access_status: str = "AUTHORIZED"
    access_level: str = "General Access"
    access_start_date: Optional[date] = None
    access_expiry_date: Optional[date] = None
    registration_date: Optional[date] = None
    photo_url: Optional[str] = None
    ppe_requirements: PPERequirements = Field(default_factory=PPERequirements)
    safety_notes: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class WorkerCreate(WorkerBase):
    user_id: Optional[str] = None


class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    assigned_project_id: Optional[str] = None
    assigned_zone_id: Optional[str] = None
    status: Optional[str] = None
    access_status: Optional[str] = None
    access_level: Optional[str] = None
    access_start_date: Optional[date] = None
    access_expiry_date: Optional[date] = None
    photo_url: Optional[str] = None
    ppe_requirements: Optional[PPERequirements] = None
    safety_notes: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    is_archived: Optional[bool] = None


class WorkerResponse(WorkerBase):
    id: str
    user_id: Optional[str] = None
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
