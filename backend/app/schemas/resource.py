from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ResourceBase(BaseModel):
    project_id: str
    name: str
    type: str = "MATERIAL"
    quantity: float = 0.0
    unit: str = "units"
    utilization_rate: float = 0.0
    status: str = "Normal"
    notes: Optional[str] = None


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    utilization_rate: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class ResourceResponse(ResourceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
