from datetime import date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Float, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project


class Equipment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "equipment"

    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    serial_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="Active", nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    utilization_rate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    next_maintenance_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="equipment")
