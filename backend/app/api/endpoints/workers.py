from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_active_worker
from app.models.user import User
from app.models.worker import Worker
from app.models.gate_access import GateAccess
from app.models.safety_compliance import SafetyCompliance
from app.models.safety_issue import SafetyIssue

from app.schemas.worker import WorkerResponse, WorkerUpdate
from app.schemas.attendance import AttendanceResponse
from app.schemas.gate_access import GateAccessResponse
from app.schemas.safety_compliance import SafetyComplianceResponse
from app.schemas.safety_issue import SafetyIssueCreate, SafetyIssueResponse
from app.schemas.leave_request import LeaveRequestWorkerSubmit, LeaveRequestResponse
from app.schemas.notification import NotificationResponse

from app.services.worker_service import WorkerService
from app.services.attendance_service import AttendanceService
from app.services.safety_service import SafetyService
from app.services.leave_service import LeaveService
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/workers", tags=["Workers"])


def get_current_worker_record(db: Session, current_user: User) -> Worker:
    """Helper to resolve the Worker profile linked to current user."""
    worker = WorkerService.get_by_user_id(db, current_user.id)
    if not worker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No worker profile associated with this user account"
        )
    return worker


# 1. Worker Dashboard
@router.get("/dashboard")
def get_worker_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_worker)
) -> Dict[str, Any]:
    """Retrieve personal summary, attendance stats, safety compliance, and notifications."""
    worker = get_current_worker_record(db, current_user)
    
    attendance_records = AttendanceService.get_worker_attendance(db, worker.id, limit=5)
    compliance = db.query(SafetyCompliance).filter(SafetyCompliance.worker_id == worker.id).first()
    issues = db.query(SafetyIssue).filter(SafetyIssue.reporter_id == worker.id).all()
    notifications = NotificationService.get_by_user(db, current_user.id, unread_only=True, limit=5)

    return {
        "worker": worker,
        "recent_attendance": attendance_records,
        "safety_compliance": compliance,
        "reported_issues_count": len(issues),
        "unread_notifications": notifications,
    }


# 2. My Attendance
@router.get("/attendance", response_model=List[AttendanceResponse])
def get_my_attendance(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_worker)
):
    """Retrieve current worker's attendance history and working hours."""
    worker = get_current_worker_record(db, current_user)
    return AttendanceService.get_worker_attendance(db, worker.id, skip=skip, limit=limit)


# 3. Gate Access
@router.get("/gate-access", response_model=List[GateAccessResponse])
def get_my_gate_access(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_worker)
):
    """Retrieve entry/exit checkpoint history and gate scan logs."""
    worker = get_current_worker_record(db, current_user)
    return (
        db.query(GateAccess)
        .filter(GateAccess.worker_id == worker.id)
        .order_by(GateAccess.entry_time.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# 4. My Safety Status
@router.get("/safety-status")
def get_my_safety_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_worker)
) -> Dict[str, Any]:
    """Retrieve personal safety compliance, PPE checklist, and status."""
    worker = get_current_worker_record(db, current_user)
    compliance = db.query(SafetyCompliance).filter(SafetyCompliance.worker_id == worker.id).first()
    return {
        "worker_id": worker.id,
        "ppe_requirements": worker.ppe_requirements,
        "compliance": compliance,
        "access_status": worker.access_status,
        "access_level": worker.access_level,
    }


# 5. Report an Issue
@router.post("/report-issue", response_model=SafetyIssueResponse, status_code=status.HTTP_201_CREATED)
def report_safety_issue(
    issue_in: SafetyIssueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_worker)
):
    """Submit a safety observation or hazard report."""
    worker = get_current_worker_record(db, current_user)
    issue_in.reporter_id = worker.id
    return SafetyService.create_issue(db, issue_in)


# 6. My Reports
@router.get("/reports", response_model=List[SafetyIssueResponse])
def get_my_reports(
    status_filter: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_worker)
):
    """View list of issues and reports submitted by the worker."""
    worker = get_current_worker_record(db, current_user)
    return SafetyService.get_issues(db, status_filter=status_filter, skip=skip, limit=limit)


# 7. Leave Management
@router.post("/leave", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
def submit_leave_request(
    leave_in: LeaveRequestWorkerSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_worker)
):
    """Submit a new leave application."""
    worker = get_current_worker_record(db, current_user)
    return LeaveService.submit(db, worker.id, leave_in)


@router.get("/leave", response_model=List[LeaveRequestResponse])
def get_my_leave_requests(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_worker)
):
    """View status and history of worker leave applications."""
    worker = get_current_worker_record(db, current_user)
    return LeaveService.get_by_worker(db, worker.id, skip=skip, limit=limit)


# 8. Notifications
@router.get("/notifications", response_model=List[NotificationResponse])
def get_my_notifications(
    unread_only: bool = Query(False),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_worker)
):
    """Retrieve alerts and notifications."""
    return NotificationService.get_by_user(db, current_user.id, unread_only=unread_only, skip=skip, limit=limit)


@router.patch("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_worker)
):
    """Mark specific notification as read."""
    return NotificationService.mark_as_read(db, notification_id, current_user.id)


# 9. Worker Profile
@router.get("/profile", response_model=WorkerResponse)
def get_worker_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_worker)
):
    """View authenticated worker's full profile."""
    return get_current_worker_record(db, current_user)


@router.put("/profile", response_model=WorkerResponse)
def update_worker_profile(
    worker_in: WorkerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_worker)
):
    """Update editable contact details and basic information."""
    worker = get_current_worker_record(db, current_user)
    # Disallow self-modification of clearance or project assignment
    safe_update = WorkerUpdate(
        phone=worker_in.phone,
        emergency_contact_name=worker_in.emergency_contact_name,
        emergency_contact_phone=worker_in.emergency_contact_phone,
        photo_url=worker_in.photo_url,
    )
    return WorkerService.update(db, worker.id, safe_update)
