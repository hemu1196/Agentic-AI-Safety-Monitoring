from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.worker import Worker
    from app.models.site import Site, Zone


class GateAccess(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "gate_access_logs"

    worker_id: Mapped[str] = mapped_column(String(36), ForeignKey("workers.id", ondelete="CASCADE"), nullable=False, index=True)
    site_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("sites.id", ondelete="SET NULL"), nullable=True, index=True)
    zone_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("zones.id", ondelete="SET NULL"), nullable=True, index=True)
    
    entry_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    exit_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    ppe_score: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    access_result: Mapped[str] = mapped_column(String(50), default="ALLOWED", nullable=False)
    denial_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ON SITE", nullable=False)

    # Relationships
    worker: Mapped["Worker"] = relationship("Worker", back_populates="gate_access_logs")
    site: Mapped[Optional["Site"]] = relationship("Site", back_populates="gate_access_logs")
    zone: Mapped[Optional["Zone"]] = relationship("Zone", back_populates="gate_access_logs")
