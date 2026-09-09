from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.core.security import decode_access_token
from app.models.user import User, UserRole, UserStatus

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_db() -> Generator[Session, None, None]:
    """Database session dependency yields session and ensures clean closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Validate bearer token and return authenticated User record."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    if user.status != UserStatus.ACTIVE.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
        
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Ensure current user is active."""
    return current_user


def get_current_active_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Enforce ADMIN role authorization."""
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


def get_current_active_worker(
    current_user: User = Depends(get_current_user)
) -> User:
    """Enforce WORKER role authorization."""
    if current_user.role != UserRole.WORKER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Worker privileges required"
        )
    return current_user


def require_role(allowed_roles: List[str]):
    """Generic role-checking dependency factory."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles}"
            )
        return current_user
    return role_checker
