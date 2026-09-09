from datetime import datetime
from typing import Optional, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.worker import Worker
    from app.models.project import Project
    from app.models.site import Zone


class SafetyIssue(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "safety_issues"

    reporter_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("workers.id", ondelete="SET NULL"), nullable=True, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("zones.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(50), default="Warning", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False, index=True)
    
    evidence_file_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    evidence_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    worker: Mapped[Optional["Worker"]] = relationship("Worker", back_populates="reported_issues")
    project: Mapped["Project"] = relationship("Project", back_populates="safety_issues")
    zone: Mapped[Optional["Zone"]] = relationship("Zone", back_populates="safety_issues")
