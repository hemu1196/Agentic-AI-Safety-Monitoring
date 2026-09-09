from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: str
    status: str = "ACTIVE"
    avatar_url: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    role: str = "WORKER"
    avatar_url: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    status: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = None


class UserResponse(UserBase):
    id: str
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
