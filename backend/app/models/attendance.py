from datetime import datetime, date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Float, ForeignKey, Text, Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.worker import Worker


class Attendance(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "attendance"

    worker_id: Mapped[str] = mapped_column(String(36), ForeignKey("workers.id", ondelete="CASCADE"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    check_in_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    check_out_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    total_hours: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PRESENT", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    worker: Mapped["Worker"] = relationship("Worker", back_populates="attendance_records")
