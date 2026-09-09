from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project, Task
    from app.models.worker import Worker
    from app.models.safety_issue import SafetyIssue
    from app.models.safety_monitoring import SafetyMonitoringRecord
    from app.models.risk_analytics import RiskAssessment
    from app.models.gate_access import GateAccess


class Site(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "sites"

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    client_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    zones: Mapped[List["Zone"]] = relationship("Zone", back_populates="site", cascade="all, delete-orphan")
    projects: Mapped[List["Project"]] = relationship("Project", back_populates="site", cascade="all, delete-orphan")
    gate_access_logs: Mapped[List["GateAccess"]] = relationship("GateAccess", back_populates="site", cascade="all, delete-orphan")


class Zone(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "zones"

    site_id: Mapped[str] = mapped_column(String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    max_capacity: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    is_restricted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    site: Mapped["Site"] = relationship("Site", back_populates="zones")
    workers: Mapped[List["Worker"]] = relationship("Worker", back_populates="assigned_zone")
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="zone")
    safety_issues: Mapped[List["SafetyIssue"]] = relationship("SafetyIssue", back_populates="zone")
    safety_records: Mapped[List["SafetyMonitoringRecord"]] = relationship("SafetyMonitoringRecord", back_populates="zone")
    risk_assessments: Mapped[List["RiskAssessment"]] = relationship("RiskAssessment", back_populates="zone")
    gate_access_logs: Mapped[List["GateAccess"]] = relationship("GateAccess", back_populates="zone")
