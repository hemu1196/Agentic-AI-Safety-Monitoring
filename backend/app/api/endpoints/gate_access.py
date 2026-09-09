from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.models.worker import Worker
from app.models.gate_access import GateAccess
from app.schemas.gate_access import (
    GateAccessResponse, GateEntryRequest, GateExitRequest
)

router = APIRouter(prefix="/gate-access", tags=["Gate Access Control"])


@router.post("/entry", response_model=GateAccessResponse, status_code=status.HTTP_201_CREATED)
def record_gate_entry(
    entry_data: GateEntryRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Record worker entry via security gate scanner or camera checkpoint."""
    worker = db.query(Worker).filter(Worker.id == entry_data.worker_id).first()
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")

    access_result = "ALLOWED"
    denial_reason = None
    log_status = "ON SITE"

    if worker.access_status == "REVOKED":
        access_result = "DENIED"
        denial_reason = "Access clearance revoked"
        log_status = "ACCESS DENIED"
    elif entry_data.ppe_score < 70.0:
        access_result = "DENIED"
        denial_reason = "Insufficient PPE compliance"
        log_status = "ACCESS DENIED"
    else:
        worker.status = "ON SITE"

    log = GateAccess(
        worker_id=worker.id,
        site_id=entry_data.site_id or worker.assigned_project_id,
        zone_id=entry_data.zone_id or worker.assigned_zone_id,
        entry_time=datetime.now(timezone.utc),
        ppe_score=entry_data.ppe_score,
        access_result=access_result,
        denial_reason=denial_reason,
        status=log_status,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.post("/exit", response_model=GateAccessResponse)
def record_gate_exit(
    exit_data: GateExitRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Record worker exit via security gate."""
    worker = db.query(Worker).filter(Worker.id == exit_data.worker_id).first()
    if not worker:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Worker not found")

    active_entry = (
        db.query(GateAccess)
        .filter(GateAccess.worker_id == worker.id, GateAccess.status == "ON SITE")
        .order_by(GateAccess.entry_time.desc())
        .first()
    )

    now = datetime.now(timezone.utc)
    if active_entry:
        active_entry.exit_time = now
        active_entry.status = "EXITED"
        worker.status = "OFF SITE"
        db.commit()
        db.refresh(active_entry)
        return active_entry

    # Create exit log if no prior active record
    exit_log = GateAccess(
        worker_id=worker.id,
        entry_time=now,
        exit_time=now,
        ppe_score=100.0,
        access_result="ALLOWED",
        status="EXITED",
    )
    worker.status = "OFF SITE"
    db.add(exit_log)
    db.commit()
    db.refresh(exit_log)
    return exit_log


@router.get("/logs", response_model=List[GateAccessResponse])
def get_gate_access_logs(
    worker_id: Optional[str] = Query(None),
    site_id: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Retrieve full gate access logs (Admin only)."""
    query = db.query(GateAccess)
    if worker_id:
        query = query.filter(GateAccess.worker_id == worker_id)
    if site_id:
        query = query.filter(GateAccess.site_id == site_id)
    return query.order_by(GateAccess.entry_time.desc()).offset(skip).limit(limit).all()
