from datetime import date
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.schemas.attendance import (
    AttendanceResponse, AttendanceCheckIn, AttendanceCheckOut
)
from app.services.attendance_service import AttendanceService

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/check-in", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def check_in(
    data: AttendanceCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Record worker check-in timestamp."""
    return AttendanceService.check_in(db, data.worker_id, notes=data.notes)


@router.post("/check-out", response_model=AttendanceResponse)
def check_out(
    data: AttendanceCheckOut,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Record worker check-out timestamp and compute total working hours."""
    return AttendanceService.check_out(db, data.worker_id, notes=data.notes)


@router.get("/daily-summary")
def get_daily_summary(
    target_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
) -> Dict[str, Any]:
    """Retrieve daily site attendance summary (Admin only)."""
    return AttendanceService.get_daily_summary(db, target_date=target_date)


@router.get("/worker/{worker_id}", response_model=List[AttendanceResponse])
def get_worker_attendance(
    worker_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get attendance logs for a specific worker."""
    return AttendanceService.get_worker_attendance(db, worker_id, skip=skip, limit=limit)
