from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole, UserStatus
from app.models.worker import Worker
from app.schemas.auth import RegisterRequest, LoginRequest, Token
from app.core.security import verify_password, get_password_hash, create_access_token


class AuthService:
    @staticmethod
    def register(db: Session, request: RegisterRequest) -> User:
        # Check if email exists
        if db.query(User).filter(User.email == request.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        # Check if username exists
        if db.query(User).filter(User.username == request.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this username already exists"
            )

        # Normalize role
        role_upper = request.role.upper()
        if role_upper not in [UserRole.ADMIN.value, UserRole.WORKER.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be ADMIN or WORKER"
            )

        # Create user
        new_user = User(
            email=request.email,
            username=request.username,
            hashed_password=get_password_hash(request.password),
            full_name=request.full_name,
            role=role_upper,
            status=UserStatus.ACTIVE.value,
        )
        db.add(new_user)
        db.flush()

        # If role is WORKER, create a linked worker profile if requested
        if role_upper == UserRole.WORKER.value:
            worker_code = request.worker_code or f"W-{new_user.id[:8].upper()}"
            worker = Worker(
                user_id=new_user.id,
                worker_code=worker_code,
                name=request.full_name,
                email=request.email,
                role="General Worker",
            )
            db.add(worker)

        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate(db: Session, request: LoginRequest) -> Token:
        # Search by username or email
        user = (
            db.query(User)
            .filter(
                (User.username == request.username_or_email)
                | (User.email == request.username_or_email)
            )
            .first()
        )

        if not user or not verify_password(request.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if user.status != UserStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated"
            )

        # Update last login
        user.last_login = datetime.now(timezone.utc)
        db.commit()

        # Issue JWT
        token = create_access_token(subject=user.id, role=user.role)
        return Token(
            access_token=token,
            token_type="bearer",
            role=user.role,
            user_id=user.id,
            username=user.username,
        )
