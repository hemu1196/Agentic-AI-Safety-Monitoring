"""Pydantic Schemas Package"""
from app.schemas.auth import Token, TokenData, LoginRequest, RegisterRequest, ChangePasswordRequest
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserResponse
from app.schemas.worker import WorkerBase, WorkerCreate, WorkerUpdate, WorkerResponse, PPERequirements
from app.schemas.attendance import (
    AttendanceBase, AttendanceCreate, AttendanceUpdate, AttendanceResponse,
    AttendanceCheckIn, AttendanceCheckOut
)
from app.schemas.safety_issue import SafetyIssueBase, SafetyIssueCreate, SafetyIssueUpdate, SafetyIssueResponse
from app.schemas.safety_monitoring import (
    SafetyMonitoringBase, SafetyMonitoringCreate, SafetyMonitoringResponse, SafetySummaryResponse
)
from app.schemas.risk_analytics import (
    RiskAssessmentBase, RiskAssessmentCreate, RiskAssessmentResponse,
    ZoneRiskSummary, RiskAnalyticsSummaryResponse
)
from app.schemas.project import (
    ProjectBase, ProjectCreate, ProjectUpdate, ProjectResponse,
    TaskBase, TaskCreate, TaskUpdate, TaskResponse
)
from app.schemas.resource import ResourceBase, ResourceCreate, ResourceUpdate, ResourceResponse
from app.schemas.equipment import EquipmentBase, EquipmentCreate, EquipmentUpdate, EquipmentResponse
from app.schemas.report import ReportBase, ReportCreate, ReportUpdate, ReportResponse
from app.schemas.notification import NotificationBase, NotificationCreate, NotificationUpdate, NotificationResponse
from app.schemas.leave_request import (
    LeaveRequestBase, LeaveRequestCreate, LeaveRequestResponse,
    LeaveRequestWorkerSubmit, LeaveRequestReview
)
from app.schemas.gate_access import (
    GateAccessBase, GateAccessCreate, GateAccessResponse, GateEntryRequest, GateExitRequest
)
from app.schemas.safety_compliance import (
    SafetyComplianceBase, SafetyComplianceCreate, SafetyComplianceUpdate, SafetyComplianceResponse
)
from app.schemas.site import SiteBase, SiteCreate, SiteUpdate, SiteResponse, ZoneBase, ZoneCreate, ZoneUpdate, ZoneResponse

__all__ = [
    "Token",
    "TokenData",
    "LoginRequest",
    "RegisterRequest",
    "ChangePasswordRequest",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "WorkerBase",
    "WorkerCreate",
    "WorkerUpdate",
    "WorkerResponse",
    "PPERequirements",
    "AttendanceBase",
    "AttendanceCreate",
    "AttendanceUpdate",
    "AttendanceResponse",
    "AttendanceCheckIn",
    "AttendanceCheckOut",
    "SafetyIssueBase",
    "SafetyIssueCreate",
    "SafetyIssueUpdate",
    "SafetyIssueResponse",
    "SafetyMonitoringBase",
    "SafetyMonitoringCreate",
    "SafetyMonitoringResponse",
    "SafetySummaryResponse",
    "RiskAssessmentBase",
    "RiskAssessmentCreate",
    "RiskAssessmentResponse",
    "ZoneRiskSummary",
    "RiskAnalyticsSummaryResponse",
    "ProjectBase",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    "TaskBase",
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    "ResourceBase",
    "ResourceCreate",
    "ResourceUpdate",
    "ResourceResponse",
    "EquipmentBase",
    "EquipmentCreate",
    "EquipmentUpdate",
    "EquipmentResponse",
    "ReportBase",
    "ReportCreate",
    "ReportUpdate",
    "ReportResponse",
    "NotificationBase",
    "NotificationCreate",
    "NotificationUpdate",
    "NotificationResponse",
    "LeaveRequestBase",
    "LeaveRequestCreate",
    "LeaveRequestResponse",
    "LeaveRequestWorkerSubmit",
    "LeaveRequestReview",
    "GateAccessBase",
    "GateAccessCreate",
    "GateAccessResponse",
    "GateEntryRequest",
    "GateExitRequest",
    "SafetyComplianceBase",
    "SafetyComplianceCreate",
    "SafetyComplianceUpdate",
    "SafetyComplianceResponse",
    "SiteBase",
    "SiteCreate",
    "SiteUpdate",
    "SiteResponse",
    "ZoneBase",
    "ZoneCreate",
    "ZoneUpdate",
    "ZoneResponse",
]
