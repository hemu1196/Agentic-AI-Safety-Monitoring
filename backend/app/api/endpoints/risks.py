from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.schemas.risk_analytics import (
    RiskAssessmentResponse, RiskAssessmentCreate, RiskAnalyticsSummaryResponse
)
from app.services.risk_service import RiskService

router = APIRouter(prefix="/risks", tags=["Risk Analytics"])


@router.get("/", response_model=List[RiskAssessmentResponse])
def get_risk_assessments(
    project_id: Optional[str] = Query(None),
    zone_id: Optional[str] = Query(None),
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve historical and recorded risk evaluations."""
    return RiskService.get_assessments(db, project_id=project_id, zone_id=zone_id, limit=limit)


@router.post("/", response_model=RiskAssessmentResponse, status_code=status.HTTP_201_CREATED)
def record_risk_assessment(
    risk_in: RiskAssessmentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Record a multi-factor risk assessment (Admin only)."""
    return RiskService.create_assessment(db, risk_in)


@router.get("/summary", response_model=RiskAnalyticsSummaryResponse)
def get_risk_summary(
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get calculated site and zone risk indices."""
    return RiskService.get_risk_summary(db, project_id=project_id)
