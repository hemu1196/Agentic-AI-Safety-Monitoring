from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AttendanceBase(BaseModel):
    worker_id: str
    date: date
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    total_hours: float = 0.0
    status: str = "PRESENT"
    notes: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceCheckIn(BaseModel):
    worker_id: str
    notes: Optional[str] = None


class AttendanceCheckOut(BaseModel):
    worker_id: str
    notes: Optional[str] = None


class AttendanceUpdate(BaseModel):
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    total_hours: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class AttendanceResponse(AttendanceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
