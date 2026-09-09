from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project
    from app.models.site import Zone


class RiskAssessment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "risk_assessments"

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("zones.id", ondelete="SET NULL"), nullable=True, index=True)
    
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(50), default="Low", nullable=False)
    risk_coefficient: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    primary_driver: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mitigation_plan: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="risk_assessments")
    zone: Mapped[Optional["Zone"]] = relationship("Zone", back_populates="risk_assessments")
