from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.schemas.leave_request import (
    LeaveRequestResponse, LeaveRequestWorkerSubmit, LeaveRequestReview
)
from app.services.leave_service import LeaveService
from app.services.worker_service import WorkerService

router = APIRouter(prefix="/leave", tags=["Leave Management"])


@router.get("/", response_model=List[LeaveRequestResponse])
def get_all_leave_requests(
    status_filter: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """List all leave requests across the workforce (Admin only)."""
    return LeaveService.get_all(db, status_filter=status_filter, skip=skip, limit=limit)


@router.post("/", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
def apply_leave(
    leave_in: LeaveRequestWorkerSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Submit a leave request."""
    worker = WorkerService.get_by_user_id(db, current_user.id)
    if not worker:
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No worker profile found")
    return LeaveService.submit(db, worker.id, leave_in)


@router.put("/{leave_id}/review", response_model=LeaveRequestResponse)
def review_leave_request(
    leave_id: str,
    review_in: LeaveRequestReview,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Approve or reject a worker leave request (Admin only)."""
    return LeaveService.review(db, leave_id, admin.id, review_in)
