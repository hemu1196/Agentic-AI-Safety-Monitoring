from datetime import date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, ForeignKey, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.site import Zone


class SafetyMonitoringRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "safety_monitoring_records"

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("zones.id", ondelete="SET NULL"), nullable=True, index=True)
    
    safety_score: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    violation_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    inspection_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="NORMAL", nullable=False)
    trend_indicator: Mapped[str] = mapped_column(String(50), default="stable", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="safety_records")
    zone: Mapped[Optional["Zone"]] = relationship("Zone", back_populates="safety_records")
