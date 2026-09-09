from datetime import date
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, Boolean, ForeignKey, Text, JSON, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.project import Project
    from app.models.site import Zone
    from app.models.attendance import Attendance
    from app.models.gate_access import GateAccess
    from app.models.leave_request import LeaveRequest
    from app.models.safety_compliance import SafetyCompliance
    from app.models.safety_issue import SafetyIssue


class Worker(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "workers"

    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)
    worker_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(100), default="Worker", nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    assigned_project_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_zone_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("zones.id", ondelete="SET NULL"), nullable=True, index=True)
    
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    access_status: Mapped[str] = mapped_column(String(50), default="AUTHORIZED", nullable=False)
    access_level: Mapped[str] = mapped_column(String(50), default="General Access", nullable=False)
    
    access_start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    access_expiry_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    registration_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    ppe_requirements: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        default=lambda: {"helmet": True, "vest": True, "shoes": True, "gloves": True, "badge": True},
        nullable=False
    )
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    safety_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="worker_profile")
    assigned_project: Mapped[Optional["Project"]] = relationship("Project", back_populates="workers")
    assigned_zone: Mapped[Optional["Zone"]] = relationship("Zone", back_populates="workers")
    
    attendance_records: Mapped[List["Attendance"]] = relationship("Attendance", back_populates="worker", cascade="all, delete-orphan")
    gate_access_logs: Mapped[List["GateAccess"]] = relationship("GateAccess", back_populates="worker", cascade="all, delete-orphan")
    leave_requests: Mapped[List["LeaveRequest"]] = relationship("LeaveRequest", back_populates="worker", cascade="all, delete-orphan", foreign_keys="LeaveRequest.worker_id")
    safety_compliance: Mapped[Optional["SafetyCompliance"]] = relationship("SafetyCompliance", back_populates="worker", uselist=False, cascade="all, delete-orphan")
    reported_issues: Mapped[List["SafetyIssue"]] = relationship("SafetyIssue", back_populates="worker", cascade="all, delete-orphan")
