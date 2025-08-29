"""
Authentication routes for Secret Safe API
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext

from ..models.user import User, UserCreate, UserLogin, UserProfile
from ..config import settings

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# JWT token functions


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str):
    return pwd_context.hash(password)

# Dependency to get current user


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY,
                             algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    # TODO: Get user from database
    # user = get_user_by_id(user_id)
    # if user is None:
    #     raise credentials_exception
    # return user

    # Placeholder user for now
    return User(
        id="placeholder-id",
        email="user@example.com",
        password_hash="",
        role="writer"
    )


@router.post("/register", response_model=UserProfile)
async def register(user_data: UserCreate):
    """Register a new user"""
    # TODO: Implement user registration
    # - Check if email already exists
    # - Hash password
    # - Create user in database
    # - Send verification email

    # Placeholder response
    return UserProfile(
        id="new-user-id",
        email=user_data.email,
        display_name=user_data.display_name,
        role=user_data.role,
        is_active=True,
        created_at=datetime.utcnow(),
        last_check_in=None
    )


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login user and return access token"""
    # TODO: Implement user login
    # - Verify email/password
    # - Check if user is active
    # - Update last login
    # - Return JWT token

    # Placeholder response
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": "user@example.com"}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout user (invalidate token)"""
    # TODO: Implement token invalidation
    # - Add token to blacklist
    # - Update user session

    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        display_name=current_user.display_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        last_check_in=current_user.last_check_in
    )


@router.post("/refresh")
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token"""
    # TODO: Implement token refresh
    # - Validate current token
    # - Generate new token

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/forgot-password")
async def forgot_password(email: str):
    """Send password reset email"""
    # TODO: Implement password reset
    # - Check if email exists
    # - Generate reset token
    # - Send reset email

    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(token: str, new_password: str):
    """Reset password with token"""
    # TODO: Implement password reset
    # - Validate reset token
    # - Update password
    # - Invalidate token

    return {"message": "Password successfully reset"}

