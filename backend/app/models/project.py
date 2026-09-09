from datetime import datetime, date
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, ForeignKey, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.site import Site, Zone
    from app.models.worker import Worker
    from app.models.resource import Resource
    from app.models.equipment import Equipment
    from app.models.report import Report
    from app.models.safety_issue import SafetyIssue
    from app.models.safety_monitoring import SafetyMonitoringRecord
    from app.models.risk_analytics import RiskAssessment


class Project(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "projects"

    site_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("sites.id", ondelete="SET NULL"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    progress: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    target_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="IN_PROGRESS", nullable=False)
    manager_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    site: Mapped[Optional["Site"]] = relationship("Site", back_populates="projects")
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    workers: Mapped[List["Worker"]] = relationship("Worker", back_populates="assigned_project")
    resources: Mapped[List["Resource"]] = relationship("Resource", back_populates="project", cascade="all, delete-orphan")
    equipment: Mapped[List["Equipment"]] = relationship("Equipment", back_populates="project", cascade="all, delete-orphan")
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="project", cascade="all, delete-orphan")
    safety_issues: Mapped[List["SafetyIssue"]] = relationship("SafetyIssue", back_populates="project", cascade="all, delete-orphan")
    safety_records: Mapped[List["SafetyMonitoringRecord"]] = relationship("SafetyMonitoringRecord", back_populates="project", cascade="all, delete-orphan")
    risk_assessments: Mapped[List["RiskAssessment"]] = relationship("RiskAssessment", back_populates="project", cascade="all, delete-orphan")


class Task(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "tasks"

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("zones.id", ondelete="SET NULL"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    owner: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    due_date: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    progress: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="tasks")
    zone: Mapped[Optional["Zone"]] = relationship("Zone", back_populates="tasks")
