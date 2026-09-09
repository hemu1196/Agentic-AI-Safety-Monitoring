from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ZoneBase(BaseModel):
    name: str
    description: Optional[str] = None
    risk_score: float = 0.0
    max_capacity: int = 50
    is_restricted: bool = False


class ZoneCreate(ZoneBase):
    site_id: str


class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    risk_score: Optional[float] = None
    max_capacity: Optional[int] = None
    is_restricted: Optional[bool] = None


class ZoneResponse(ZoneBase):
    id: str
    site_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SiteBase(BaseModel):
    name: str
    location: str
    client_name: Optional[str] = None
    status: str = "ACTIVE"
    description: Optional[str] = None


class SiteCreate(SiteBase):
    pass


class SiteUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    client_name: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None


class SiteResponse(SiteBase):
    id: str
    zones: List[ZoneResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
