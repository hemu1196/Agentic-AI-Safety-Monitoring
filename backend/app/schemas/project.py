from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class TaskBase(BaseModel):
    project_id: str
    zone_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    owner: Optional[str] = None
    due_date: Optional[str] = None
    progress: float = 0.0
    status: str = "PENDING"


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    owner: Optional[str] = None
    due_date: Optional[str] = None
    progress: Optional[float] = None
    status: Optional[str] = None
    zone_id: Optional[str] = None


class TaskResponse(TaskBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectBase(BaseModel):
    site_id: Optional[str] = None
    name: str
    code: str
    description: Optional[str] = None
    progress: float = 0.0
    target_date: Optional[date] = None
    status: str = "IN_PROGRESS"
    manager_id: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    progress: Optional[float] = None
    target_date: Optional[date] = None
    status: Optional[str] = None
    site_id: Optional[str] = None
    manager_id: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: str
    tasks: List[TaskResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
