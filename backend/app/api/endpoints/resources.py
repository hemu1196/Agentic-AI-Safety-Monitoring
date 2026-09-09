from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.schemas.resource import ResourceResponse, ResourceCreate, ResourceUpdate
from app.services.resource_service import ResourceService

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("/", response_model=List[ResourceResponse])
def list_resources(
    project_id: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve material and manpower resources."""
    return ResourceService.get_all_resources(db, project_id=project_id, skip=skip, limit=limit)


@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(
    res_in: ResourceCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Register a new resource (Admin only)."""
    return ResourceService.create_resource(db, res_in)


@router.put("/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: str,
    res_in: ResourceUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Update resource utilization or inventory (Admin only)."""
    return ResourceService.update_resource(db, resource_id, res_in)
