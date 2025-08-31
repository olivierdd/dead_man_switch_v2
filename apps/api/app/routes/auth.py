"""
Authentication routes for Secret Safe API
"""

import hashlib
from datetime import datetime, timedelta
from typing import Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from ..middleware.rate_limiting import (rate_limit_api_endpoint,
                                        rate_limit_auth_endpoint)
from ..models.database import get_db
from ..models.user import (PasswordReset, TokenBlacklist, User, UserCreate,
                           UserLogin, UserProfile, UserRole)
from ..settings import settings

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
logger = structlog.get_logger(__name__)

# JWT token functions


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token with proper payload structure"""
    to_encode = data.copy()

    # Add standard JWT claims
    to_encode.update(
        {
            "type": "access",
            "iat": datetime.utcnow(),  # Issued at
            "iss": "secret-safe-api",  # Issuer
            "aud": "secret-safe-users",  # Audience
        }
    )

    # Set expiration
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})

    # Encode JWT token
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT refresh token with extended expiration"""
    to_encode = data.copy()

    # Add standard JWT claims for refresh token
    to_encode.update(
        {
            "type": "refresh",
            "iat": datetime.utcnow(),  # Issued at
            "iss": "secret-safe-api",  # Issuer
            "aud": "secret-safe-users",  # Audience
        }
    )

    # Set expiration (longer than access token)
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({"exp": expire})

    # Encode JWT refresh token
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_user_token_payload(user: User) -> dict:
    """Create standardized token payload for user"""
    return {
        "sub": str(user.id),  # Subject (user ID)
        "email": user.email,  # User email
        "role": user.role,  # User role (admin, writer, reader)
        "is_verified": user.is_verified,  # Email verification status
        "is_active": user.is_active,  # Account active status
        "display_name": user.display_name,  # User display name
        "subscription_tier": user.subscription_tier,  # User subscription level
    }


def verify_password(plain_password: str, hashed_password: str):
    """Verify a password against its hash using bcrypt"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str):
    """Hash a password using bcrypt with cost factor 12"""
    return pwd_context.hash(password)


def hash_token(token: str) -> str:
    """Hash JWT token for secure storage in blacklist"""
    return hashlib.sha256(token.encode()).hexdigest()


def is_token_blacklisted(token: str, db: Session) -> bool:
    """Check if a token is in the blacklist"""
    token_hash = hash_token(token)

    # Check if token exists in blacklist
    blacklisted = db.exec(
        select(TokenBlacklist).where(TokenBlacklist.token_hash == token_hash)
    ).first()

    return blacklisted is not None


def add_token_to_blacklist(
    token: str, user_id: str, db: Session, reason: str = "logout"
):
    """Add a token to the blacklist"""
    try:
        # Decode token to get expiration
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        expires_at = datetime.fromtimestamp(payload.get("exp", 0))

        # Create blacklist entry
        blacklist_entry = TokenBlacklist(
            token_hash=hash_token(token),
            user_id=user_id,
            expires_at=expires_at,
            reason=reason,
        )

        db.add(blacklist_entry)
        db.commit()

        logger.info(
            "Token added to blacklist",
            user_id=user_id,
            reason=reason,
            expires_at=expires_at,
        )

    except Exception as e:
        logger.error("Failed to add token to blacklist", error=str(e))
        db.rollback()


def cleanup_expired_blacklist_entries(db: Session):
    """Remove expired entries from token blacklist"""
    try:
        expired_entries = db.exec(
            select(TokenBlacklist).where(TokenBlacklist.expires_at < datetime.utcnow())
        ).all()

        for entry in expired_entries:
            db.delete(entry)

        if expired_entries:
            db.commit()
            logger.info(f"Cleaned up {len(expired_entries)} expired blacklist entries")

    except Exception as e:
        logger.error("Failed to cleanup expired blacklist entries", error=str(e))
        db.rollback()


# Dependency to get current user


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    """Get current user from JWT token with comprehensive validation"""

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Check if token is blacklisted
        if is_token_blacklisted(token, db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been invalidated",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Decode and validate JWT token
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )

        # Extract user ID from token
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception

        # Validate token type (should be access token)
        token_type = payload.get("type")
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user from database
        user = db.exec(select(User).where(User.id == user_id)).first()

        if user is None:
            raise credentials_exception

        # Validate user account status
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if user.is_suspended:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is suspended",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Update last activity timestamp
        user.last_activity_at = datetime.utcnow()
        db.add(user)
        db.commit()

        # Log successful token validation
        logger.info(
            "Token validated successfully",
            user_id=str(user.id),
            email=user.email,
            role=user.role,
        )

        return user

    except JWTError as e:
        logger.warning("JWT validation failed", error=str(e))
        raise credentials_exception
    except Exception as e:
        logger.error("Unexpected error in token validation", error=str(e))
        raise credentials_exception


async def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Get current active user (additional verification status check)"""
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your account to access this resource.",
        )
    return current_user


async def get_current_verified_user(current_user: User = Depends(get_current_user)):
    """Get current verified user with comprehensive verification checks"""
    # Check if user account is active
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact support for assistance.",
        )

    # Check if user account is suspended
    if current_user.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended. Please contact support for assistance.",
        )

    # Check if user email is verified
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required. Please check your email and verify your account to access this resource.",
        )

    # Check if user has completed profile setup (optional)
    if not current_user.display_name:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Profile setup required. Please complete your profile to access this resource.",
        )

    return current_user


async def get_current_verified_writer_user(
    current_user: User = Depends(get_current_verified_user),
):
    """Get current verified writer or admin user with verification checks"""
    if current_user.role not in [UserRole.WRITER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Writer or admin access required. Please contact support to upgrade your account.",
        )
    return current_user


async def get_current_verified_admin_user(
    current_user: User = Depends(get_current_verified_user),
):
    """Get current verified admin user with verification checks"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required. Please contact support for administrator privileges.",
        )
    return current_user


async def get_current_user_with_verification_optional(
    current_user: User = Depends(get_current_user),
):
    """Get current user with optional verification status (for endpoints that work with both verified and unverified users)"""
    # This dependency allows both verified and unverified users to access the endpoint
    # but provides verification status information for conditional logic
    return current_user


def require_verification_status(verification_required: bool = True):
    """Decorator to conditionally require email verification based on configuration"""

    def decorator(func):
        async def wrapper(*args, **kwargs):
            # If verification is not required, skip the check
            if not verification_required:
                return await func(*args, **kwargs)

            # Extract current_user from kwargs
            current_user = kwargs.get("current_user")
            if current_user and not current_user.is_verified:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Email verification required for this feature. Please verify your account.",
                )

            return await func(*args, **kwargs)

        return wrapper

    return decorator


@router.post("/register", response_model=UserProfile)
@rate_limit_auth_endpoint("register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""

    # Check if email already exists
    existing_user = db.exec(select(User).where(User.email == user_data.email)).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Hash password with bcrypt (cost factor 12)
    hashed_password = get_password_hash(user_data.password)

    # Create new user
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        display_name=user_data.display_name
        or f"{user_data.first_name or ''} {user_data.last_name or ''}".strip(),
        role=user_data.role,
        timezone=user_data.timezone,
        language=user_data.language,
        is_verified=False,  # User needs to verify email
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    try:
        # Add user to database
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Send verification email automatically
        try:
            from ..models.verification import TokenType
            from ..services.verification_service import VerificationService
            from ..settings import get_settings

            verification_service = VerificationService(db)
            settings = get_settings()
            base_url = settings.BASE_URL or "http://localhost:3000"

            # Send verification email (async, don't wait for result)
            await verification_service.send_verification_email(
                user=new_user,
                token=await verification_service.create_verification_token(
                    user_id=new_user.id,
                    token_type=TokenType.EMAIL_VERIFICATION,
                    expiry_hours=24,
                ),
                base_url=base_url,
                expiry_hours=24,
            )

            logger.info(f"Verification email sent to {new_user.email}")

        except Exception as e:
            # Log error but don't fail registration
            logger.error(f"Failed to send verification email to {new_user.email}: {e}")
            # Continue with registration - user can request verification email later

        # Return user profile (without sensitive data)
        return UserProfile(
            id=new_user.id,
            email=new_user.email,
            display_name=new_user.display_name,
            role=new_user.role,
            is_active=new_user.is_active,
            created_at=new_user.created_at,
            last_check_in=new_user.last_check_in,
            subscription_tier=new_user.subscription_tier,
            avatar_url=new_user.avatar_url,
            bio=new_user.bio,
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account",
        )


@router.post("/login")
@rate_limit_auth_endpoint("login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Login user and return access token"""

    # Find user by email
    user = db.exec(select(User).where(User.email == form_data.username)).first()

    # Verify user exists and credentials are correct
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user account is suspended
    if user.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is suspended",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user email is verified (optional - can be made configurable)
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not verified. Please check your email and verify your account.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update last login timestamp
    user.last_login_at = datetime.utcnow()
    user.last_activity_at = datetime.utcnow()
    db.add(user)
    db.commit()

    # Generate JWT token with user information using the new payload function
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    user_payload = create_user_token_payload(user)
    access_token = create_access_token(
        data=user_payload, expires_delta=access_token_expires
    )

    # Log successful login
    logger.info(
        "User logged in successfully",
        user_id=str(user.id),
        email=user.email,
        role=user.role,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
            "is_verified": user.is_verified,
        },
    }


@router.post("/logout")
@rate_limit_api_endpoint("logout")
async def logout(
    token: str = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Logout user and invalidate token"""

    try:
        # Add token to blacklist
        add_token_to_blacklist(token, str(current_user.id), db, "logout")

        # Update user's last activity
        current_user.last_activity_at = datetime.utcnow()
        db.add(current_user)
        db.commit()

        # Clean up expired blacklist entries
        cleanup_expired_blacklist_entries(db)

        # Log successful logout
        logger.info(
            "User logged out successfully",
            user_id=str(current_user.id),
            email=current_user.email,
        )

        return {
            "message": "Successfully logged out",
            "logout_time": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        logger.error("Logout failed", error=str(e), user_id=str(current_user.id))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed. Please try again.",
        )


@router.get("/me", response_model=UserProfile)
@rate_limit_api_endpoint("profile")
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        display_name=current_user.display_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        last_check_in=current_user.last_check_in,
        subscription_tier=current_user.subscription_tier,
        avatar_url=current_user.avatar_url,
        bio=current_user.bio,
    )


@router.post("/refresh")
@rate_limit_api_endpoint("refresh")
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token"""
    # TODO: Implement token refresh
    # - Validate current token
    # - Generate new token

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(current_user.id)}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


@router.post("/forgot-password")
@rate_limit_auth_endpoint("password_reset")
async def forgot_password(email: str):
    """Send password reset email"""
    # TODO: Implement password reset
    # - Check if email exists
    # - Generate reset token
    # - Send reset email

    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
@rate_limit_auth_endpoint("password_reset")
async def reset_password(password_data: PasswordReset, db: Session = Depends(get_db)):
    """Reset password with token and password strength validation"""
    # TODO: Implement password reset
    # - Validate reset token
    # - Update password (password strength already validated by PasswordReset model)
    # - Invalidate token

    # The PasswordReset model automatically validates password strength
    # through the @validator('new_password') decorator

    return {"message": "Password successfully reset"}
