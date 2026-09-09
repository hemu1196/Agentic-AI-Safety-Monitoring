from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    username: str


class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None


class LoginRequest(BaseModel):
    username_or_email: str = Field(..., description="Username or email address")
    password: str = Field(..., min_length=6, description="User password")


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: str = Field(default="WORKER", description="User role: ADMIN or WORKER")
    worker_code: Optional[str] = Field(None, description="Required if registering as WORKER")


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)
