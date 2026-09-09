from typing import List
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user, get_current_active_admin
from app.models.user import User
from app.schemas.project import (
    ProjectResponse, ProjectCreate, ProjectUpdate, TaskResponse, TaskCreate, TaskUpdate
)
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/", response_model=List[ProjectResponse])
def get_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve all construction projects with embedded tasks."""
    return ProjectService.get_all(db, skip=skip, limit=limit)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project_by_id(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve specific project by ID."""
    project = ProjectService.get_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Create a new project (Admin only)."""
    return ProjectService.create(db, project_in)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Update project status, progress, or attributes (Admin only)."""
    return ProjectService.update(db, project_id, project_in)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Delete a project (Admin only)."""
    ProjectService.delete(db, project_id)
    return None


@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Create a project task (Admin only)."""
    return ProjectService.create_task(db, task_in)


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Update a task's progress or status (Admin only)."""
    return ProjectService.update_task(db, task_id, task_in)
