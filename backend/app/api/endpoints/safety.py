from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.schemas.safety_issue import SafetyIssueResponse, SafetyIssueCreate, SafetyIssueUpdate
from app.schemas.safety_monitoring import SafetyMonitoringResponse, SafetyMonitoringCreate, SafetySummaryResponse
from app.services.safety_service import SafetyService

router = APIRouter(prefix="/safety", tags=["Safety"])


@router.get("/issues", response_model=List[SafetyIssueResponse])
def list_safety_issues(
    project_id: Optional[str] = Query(None),
    zone_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    severity_filter: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List safety issues and observations."""
    return SafetyService.get_issues(
        db,
        project_id=project_id,
        zone_id=zone_id,
        status_filter=status_filter,
        severity_filter=severity_filter,
        skip=skip,
        limit=limit
    )


@router.get("/issues/{issue_id}", response_model=SafetyIssueResponse)
def get_safety_issue(
    issue_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve safety issue by ID."""
    issue = SafetyService.get_issue_by_id(db, issue_id)
    if not issue:
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Safety issue not found")
    return issue


@router.post("/issues", response_model=SafetyIssueResponse, status_code=status.HTTP_201_CREATED)
def create_safety_issue(
    issue_in: SafetyIssueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Report a new safety issue."""
    return SafetyService.create_issue(db, issue_in)


@router.patch("/issues/{issue_id}", response_model=SafetyIssueResponse)
def update_safety_issue(
    issue_id: str,
    issue_in: SafetyIssueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update issue details or mark as resolved/closed."""
    return SafetyService.update_issue(db, issue_id, issue_in)


@router.post("/monitoring", response_model=SafetyMonitoringResponse, status_code=status.HTTP_201_CREATED)
def log_safety_monitoring_record(
    record_in: SafetyMonitoringCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Log an official safety audit/monitoring record (Admin only)."""
    return SafetyService.create_monitoring_record(db, record_in)


@router.get("/summary", response_model=SafetySummaryResponse)
def get_safety_summary(
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get aggregated safety summary and scores."""
    return SafetyService.get_safety_summary(db, project_id=project_id)
