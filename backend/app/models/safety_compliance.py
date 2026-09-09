from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.worker import Worker


class SafetyCompliance(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "safety_compliance"

    worker_id: Mapped[str] = mapped_column(String(36), ForeignKey("workers.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    compliance_score: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    helmet_compliant: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    vest_compliant: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    shoes_compliant: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    gloves_compliant: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    badge_compliant: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Relationships
    worker: Mapped["Worker"] = relationship("Worker", back_populates="safety_compliance")
