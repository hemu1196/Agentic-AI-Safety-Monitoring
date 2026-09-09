from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.dependencies import get_db, get_current_active_admin
from app.models.user import User
from app.services.project_service import ProjectService
from app.services.safety_service import SafetyService
from app.services.risk_service import RiskService
from app.services.resource_service import ResourceService
from app.services.report_service import ReportService
from app.services.worker_service import WorkerService

from app.schemas.project import ProjectResponse
from app.schemas.safety_monitoring import SafetySummaryResponse
from app.schemas.risk_analytics import RiskAnalyticsSummaryResponse
from app.schemas.resource import ResourceResponse
from app.schemas.equipment import EquipmentResponse
from app.schemas.report import ReportResponse
from app.schemas.worker import WorkerResponse

from app.ai.prediction_interface import (
    ProjectDelayPredictionRequest,
    ProjectDelayPredictionResponse,
    PlaceholderPredictionEngine,
)
from app.ai.risk_prediction_interface import (
    ZoneRiskAssessmentRequest,
    ZoneRiskAssessmentResponse,
    PlaceholderRiskEngine,
)

router = APIRouter(prefix="/admin", tags=["Admin & Site Manager"])

# Placeholder AI Engines
prediction_engine = PlaceholderPredictionEngine()
risk_engine = PlaceholderRiskEngine()


# 1. Dashboard
@router.get("/dashboard")
def get_admin_dashboard(
    project_id: Optional[str] = Query(None, description="Optional project filter"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
) -> Dict[str, Any]:
    """Retrieve comprehensive site manager and executive dashboard statistics."""
    summary = ProjectService.get_dashboard_summary(db, project_id=project_id)
    return summary


# 2. Safety Monitoring
@router.get("/safety-monitoring", response_model=SafetySummaryResponse)
def get_admin_safety_monitoring(
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Retrieve site safety status, safety scores, and violation analytics."""
    return SafetyService.get_safety_summary(db, project_id=project_id)


# 3. Worker Safety
@router.get("/worker-safety", response_model=List[WorkerResponse])
def get_admin_worker_safety(
    project_id: Optional[str] = Query(None),
    zone_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """List workforce safety details, PPE compliance, and active status."""
    return WorkerService.get_all(db, project_id=project_id, zone_id=zone_id)


# 4. Risk Analytics
@router.get("/risk-analytics", response_model=RiskAnalyticsSummaryResponse)
def get_admin_risk_analytics(
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Retrieve multi-factor zone and project risk assessments."""
    return RiskService.get_risk_summary(db, project_id=project_id)


# 5. Project Monitoring
@router.get("/projects", response_model=List[ProjectResponse])
def get_admin_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """List all construction projects with progress and task breakdowns."""
    return ProjectService.get_all(db, skip=skip, limit=limit)


# 6. Resource Management
@router.get("/resources")
def get_admin_resources(
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
) -> Dict[str, Any]:
    """Retrieve material and equipment resources, utilization rates, and statuses."""
    materials = ResourceService.get_all_resources(db, project_id=project_id)
    equipment = ResourceService.get_all_equipment(db, project_id=project_id)
    return {
        "materials": materials,
        "equipment": equipment,
    }


# 7. AI Predictions (Placeholder)
@router.post("/predictions/delay", response_model=ProjectDelayPredictionResponse)
def predict_project_delay(
    request: ProjectDelayPredictionRequest,
    admin: User = Depends(get_current_active_admin)
):
    """
    AI Prediction Placeholder Endpoint:
    Predicts construction timeline delays based on multi-factor inputs.
    """
    return prediction_engine.predict_project_delay(request)


@router.post("/predictions/zone-risk", response_model=ZoneRiskAssessmentResponse)
def predict_zone_risk(
    request: ZoneRiskAssessmentRequest,
    admin: User = Depends(get_current_active_admin)
):
    """
    AI Risk Prediction Placeholder Endpoint:
    Evaluates dynamic zone risk index.
    """
    return risk_engine.evaluate_zone_risk(request)


# 8. Agentic AI (Placeholder Schema & Endpoint)
class AgentQueryRequest(BaseModel):
    prompt: str = Field(..., min_length=2, description="User instruction for the autonomous agent")
    context_scope: Optional[str] = Field("site_safety", description="Domain context: safety, scheduling, logistics")
    project_id: Optional[str] = None


class AgentActionStep(BaseModel):
    step_number: int
    action_type: str
    target: str
    description: str


class AgentQueryResponse(BaseModel):
    agent_status: str
    reasoning: str
    planned_actions: List[AgentActionStep]
    suggested_response: str


@router.post("/agentic-ai/query", response_model=AgentQueryResponse)
def query_agentic_ai(
    request: AgentQueryRequest,
    admin: User = Depends(get_current_active_admin)
):
    """
    Agentic AI Placeholder Endpoint:
    Autonomous safety agent reasoning interface (ready for LLM/Agent framework integration).
    """
    return AgentQueryResponse(
        agent_status="READY",
        reasoning=f"Analyzed query '{request.prompt}'. Verified zone safety constraints and resource schedules.",
        planned_actions=[
            AgentActionStep(
                step_number=1,
                action_type="AUDIT_INSPECTION",
                target="Zone B",
                description="Cross-verify PPE compliance log with entry gate records"
            ),
            AgentActionStep(
                step_number=2,
                action_type="ALERT_DISPATCH",
                target="Safety Officer",
                description="Send automated warning regarding high-wind crane operations"
            )
        ],
        suggested_response="All current active zones are operating within nominal safety thresholds. Recommended dispatching an inspection team to Zone B."
    )


# 9. Reports
@router.get("/reports", response_model=List[ReportResponse])
def get_admin_reports(
    project_id: Optional[str] = Query(None),
    report_type: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Retrieve safety reports, daily logs, and weekly summaries."""
    return ReportService.get_all(db, project_id=project_id, report_type=report_type, skip=skip, limit=limit)


# 12. System Settings
@router.get("/settings")
def get_system_settings(
    admin: User = Depends(get_current_active_admin)
) -> Dict[str, Any]:
    """Retrieve platform configuration and system operational settings."""
    from app.core.config import settings
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "api_prefix": settings.API_V1_STR,
        "supported_roles": ["ADMIN", "WORKER"],
        "features": {
            "ai_predictions_enabled": True,
            "agentic_ai_interface": True,
            "computer_vision_edge": True,
            "cctv_streaming_ready": True
        }
    }
