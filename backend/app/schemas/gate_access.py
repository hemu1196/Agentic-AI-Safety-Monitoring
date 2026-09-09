from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class GateAccessBase(BaseModel):
    worker_id: str
    site_id: Optional[str] = None
    zone_id: Optional[str] = None
    entry_time: datetime
    exit_time: Optional[datetime] = None
    ppe_score: float = 100.0
    access_result: str = "ALLOWED"
    denial_reason: Optional[str] = None
    status: str = "ON SITE"


class GateAccessCreate(GateAccessBase):
    pass


class GateEntryRequest(BaseModel):
    worker_id: str
    site_id: Optional[str] = None
    zone_id: Optional[str] = None
    ppe_score: float = 100.0


class GateExitRequest(BaseModel):
    worker_id: str


class GateAccessResponse(GateAccessBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
