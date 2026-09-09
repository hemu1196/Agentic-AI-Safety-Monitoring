from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class EquipmentBase(BaseModel):
    project_id: str
    name: str
    model: Optional[str] = None
    serial_number: Optional[str] = None
    status: str = "Active"
    location: Optional[str] = None
    utilization_rate: float = 0.0
    next_maintenance_date: Optional[date] = None


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    utilization_rate: Optional[float] = None
    next_maintenance_date: Optional[date] = None


class EquipmentResponse(EquipmentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
