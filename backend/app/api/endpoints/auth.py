from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_active_user
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, Token
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account (Role: ADMIN or WORKER)."""
    return AuthService.register(db=db, request=request)


@router.post("/login", response_model=Token)
def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with username/email and password; issues JWT access token."""
    return AuthService.authenticate(db=db, request=request)


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get profile of currently logged-in user."""
    return current_user
