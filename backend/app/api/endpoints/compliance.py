from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.models.safety_compliance import SafetyCompliance
from app.models.worker import Worker
from app.schemas.safety_compliance import (
    SafetyComplianceResponse, SafetyComplianceUpdate
)

router = APIRouter(prefix="/compliance", tags=["Safety Compliance"])


@router.get("/worker/{worker_id}", response_model=SafetyComplianceResponse)
def get_worker_compliance(
    worker_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve safety compliance status and PPE audit breakdown for a worker."""
    compliance = db.query(SafetyCompliance).filter(SafetyCompliance.worker_id == worker_id).first()
    if not compliance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compliance record not found")
    return compliance


@router.put("/worker/{worker_id}", response_model=SafetyComplianceResponse)
def update_worker_compliance(
    worker_id: str,
    update_in: SafetyComplianceUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Update compliance evaluation and PPE verification status (Admin/Inspector only)."""
    compliance = db.query(SafetyCompliance).filter(SafetyCompliance.worker_id == worker_id).first()
    if not compliance:
        compliance = SafetyCompliance(
            worker_id=worker_id,
            compliance_score=update_in.compliance_score,
            helmet_compliant=update_in.helmet_compliant,
            vest_compliant=update_in.vest_compliant,
            shoes_compliant=update_in.shoes_compliant,
            gloves_compliant=update_in.gloves_compliant,
            badge_compliant=update_in.badge_compliant,
            last_evaluated_at=datetime.now(timezone.utc),
        )
        db.add(compliance)
    else:
        for field, value in update_in.model_dump().items():
            setattr(compliance, field, value)
        compliance.last_evaluated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(compliance)
    return compliance


@router.get("/summary")
def get_compliance_summary(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
) -> Dict[str, Any]:
    """Overall workforce safety compliance metrics."""
    records = db.query(SafetyCompliance).all()
    if not records:
        return {
            "total_evaluated": 0,
            "average_compliance_score": 100.0,
            "fully_compliant_count": 0,
            "non_compliant_count": 0,
        }

    total = len(records)
    avg_score = sum(r.compliance_score for r in records) / total
    fully_compliant = sum(
        1 for r in records
        if r.helmet_compliant and r.vest_compliant and r.shoes_compliant and r.gloves_compliant and r.badge_compliant
    )

    return {
        "total_evaluated": total,
        "average_compliance_score": round(avg_score, 1),
        "fully_compliant_count": fully_compliant,
        "non_compliant_count": total - fully_compliant,
    }
