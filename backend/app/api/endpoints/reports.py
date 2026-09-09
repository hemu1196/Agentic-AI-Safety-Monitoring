from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.schemas.report import ReportResponse, ReportCreate, ReportUpdate
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/", response_model=List[ReportResponse])
def list_reports(
    project_id: Optional[str] = Query(None),
    report_type: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve safety reports, daily logs, and risk assessments."""
    return ReportService.get_all(db, project_id=project_id, report_type=report_type, skip=skip, limit=limit)


@router.get("/{report_id}", response_model=ReportResponse)
def get_report_by_id(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get report details by ID."""
    report = ReportService.get_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report


@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate or submit a report."""
    report_in.author_id = current_user.id
    return ReportService.create(db, report_in)


@router.put("/{report_id}", response_model=ReportResponse)
def update_report(
    report_id: str,
    report_in: ReportUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Update report details or status (Admin only)."""
    return ReportService.update(db, report_id, report_in)
