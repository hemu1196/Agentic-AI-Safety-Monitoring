from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.schemas.equipment import EquipmentResponse, EquipmentCreate, EquipmentUpdate
from app.services.resource_service import ResourceService

router = APIRouter(prefix="/equipment", tags=["Equipment"])


@router.get("/", response_model=List[EquipmentResponse])
def list_equipment(
    project_id: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List heavy machinery and site equipment with status and utilization."""
    return ResourceService.get_all_equipment(db, project_id=project_id, skip=skip, limit=limit)


@router.post("/", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
def create_equipment(
    eq_in: EquipmentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Add a new equipment entry (Admin only)."""
    return ResourceService.create_equipment(db, eq_in)


@router.put("/{equipment_id}", response_model=EquipmentResponse)
def update_equipment(
    equipment_id: str,
    eq_in: EquipmentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Update equipment status, utilization rate, or maintenance schedule (Admin only)."""
    return ResourceService.update_equipment(db, equipment_id, eq_in)
