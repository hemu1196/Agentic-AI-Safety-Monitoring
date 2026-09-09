from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class LeaveRequestBase(BaseModel):
    worker_id: str
    leave_type: str = "CASUAL"
    start_date: date
    end_date: date
    reason: str


class LeaveRequestCreate(LeaveRequestBase):
    pass


class LeaveRequestWorkerSubmit(BaseModel):
    leave_type: str = "CASUAL"
    start_date: date
    end_date: date
    reason: str


class LeaveRequestReview(BaseModel):
    status: str  # APPROVED or REJECTED
    review_notes: Optional[str] = None


class LeaveRequestResponse(LeaveRequestBase):
    id: str
    status: str
    reviewed_by_id: Optional[str] = None
    review_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
