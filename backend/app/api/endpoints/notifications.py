from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.schemas.notification import NotificationResponse, NotificationCreate
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationResponse])
def get_user_notifications(
    unread_only: bool = Query(False),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve logged-in user notifications."""
    return NotificationService.get_by_user(
        db, current_user.id, unread_only=unread_only, skip=skip, limit=limit
    )


@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    notif_in: NotificationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Send an alert/notification to a user (Admin only)."""
    return NotificationService.create(db, notif_in)


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark a notification as read."""
    return NotificationService.mark_as_read(db, notification_id, current_user.id)


@router.post("/mark-all-read")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark all notifications as read for current user."""
    count = NotificationService.mark_all_as_read(db, current_user.id)
    return {"marked_count": count}
