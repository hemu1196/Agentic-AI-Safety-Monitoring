from datetime import date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.worker import Worker
    from app.models.user import User


class LeaveRequest(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "leave_requests"

    worker_id: Mapped[str] = mapped_column(String(36), ForeignKey("workers.id", ondelete="CASCADE"), nullable=False, index=True)
    leave_type: Mapped[str] = mapped_column(String(50), default="CASUAL", nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False, index=True)
    reviewed_by_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    review_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    worker: Mapped["Worker"] = relationship("Worker", back_populates="leave_requests", foreign_keys=[worker_id])
    reviewer: Mapped[Optional["User"]] = relationship("User", foreign_keys=[reviewed_by_id])
