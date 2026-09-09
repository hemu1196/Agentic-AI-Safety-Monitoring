from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin
import enum

if TYPE_CHECKING:
    from app.models.worker import Worker
    from app.models.notification import Notification
    from app.models.report import Report


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    WORKER = "WORKER"


class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default=UserRole.WORKER.value, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default=UserStatus.ACTIVE.value, nullable=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    provider: Mapped[str] = mapped_column(String(50), default="credentials", nullable=False)

    # Relationships
    worker_profile: Mapped[Optional["Worker"]] = relationship("Worker", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="author", cascade="all, delete-orphan")
