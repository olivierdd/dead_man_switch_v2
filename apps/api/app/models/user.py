"""
User models for Secret Safe API
Role-based access control implementation
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4
from datetime import datetime, timedelta
from enum import Enum
from pydantic import validator, EmailStr

# Use TYPE_CHECKING to avoid circular imports
if TYPE_CHECKING:
    from .message import Message, MessageShare, CheckIn
    from .user import RoleChangeLog, UserPermission


class UserRole(str, Enum):
    """User roles for access control"""
    ADMIN = "admin"
    WRITER = "writer"
    READER = "reader"


class SubscriptionTier(str, Enum):
    """Subscription tiers for the service"""
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"
    ULTIMATE = "ultimate"


class User(SQLModel, table=True):
    """User model with role-based permissions"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    role: UserRole = Field(default=UserRole.WRITER, index=True)

    # Profile information
    first_name: Optional[str] = Field(default=None, max_length=100, index=True)
    last_name: Optional[str] = Field(default=None, max_length=100, index=True)
    display_name: Optional[str] = Field(
        default=None, max_length=150, index=True)
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    bio: Optional[str] = Field(default=None, max_length=1000)

    # Account status
    is_active: bool = Field(default=True, index=True)
    is_suspended: bool = Field(default=False, index=True)
    is_verified: bool = Field(default=False, index=True)
    email_verified_at: Optional[datetime] = Field(default=None)

    # Subscription and billing
    subscription_tier: SubscriptionTier = Field(
        default=SubscriptionTier.FREE, index=True)
    subscription_expires_at: Optional[datetime] = Field(
        default=None, index=True)
    billing_email: Optional[str] = Field(default=None, max_length=255)
    payment_method_id: Optional[str] = Field(default=None, max_length=100)

    # Check-in system
    last_check_in: Optional[datetime] = Field(default=None, index=True)
    check_in_interval: int = Field(default=7, ge=1, le=365)  # days
    grace_period: int = Field(default=3, ge=1, le=30)  # days
    vacation_mode_until: Optional[datetime] = Field(default=None, index=True)
    auto_check_in_enabled: bool = Field(default=True)

    # Security
    two_factor_enabled: bool = Field(default=False, index=True)
    two_factor_secret: Optional[str] = Field(default=None, max_length=100)
    failed_login_attempts: int = Field(default=0)
    locked_until: Optional[datetime] = Field(default=None, index=True)
    password_changed_at: Optional[datetime] = Field(default=None)
    last_password_reset_request: Optional[datetime] = Field(default=None)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    last_login_at: Optional[datetime] = Field(default=None, index=True)
    last_activity_at: Optional[datetime] = Field(default=None, index=True)

    # Role management
    created_by: Optional[UUID] = Field(
        default=None, foreign_key="user.id", index=True)
    role_changed_by: Optional[UUID] = Field(
        default=None, foreign_key="user.id", index=True)
    role_changed_at: Optional[datetime] = Field(default=None, index=True)

    # Preferences
    timezone: str = Field(default="UTC", max_length=50)
    language: str = Field(default="en", max_length=10)
    notification_preferences: str = Field(default="{}")  # JSON string
    privacy_settings: str = Field(default="{}")  # JSON string

    # Relationships - using forward references to avoid circular imports
    messages: List["Message"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"lazy": "selectin"})
    shared_messages: List["MessageShare"] = Relationship(
        back_populates="shared_with_user", sa_relationship_kwargs={"lazy": "selectin"})
    check_ins: List["CheckIn"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"lazy": "selectin"})
    role_changes: List["RoleChangeLog"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"lazy": "selectin"})
    permissions: List["UserPermission"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"lazy": "selectin"})

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v)
        }

    @validator('check_in_interval', 'grace_period')
    def validate_intervals(cls, v):
        if v < 1:
            raise ValueError('Interval must be at least 1 day')
        return v

    @validator('email', 'billing_email')
    def validate_email(cls, v):
        if v is not None:
            try:
                EmailStr.validate(v)
            except ValueError:
                raise ValueError('Invalid email format')
        return v

    def is_locked(self) -> bool:
        """Check if user account is locked"""
        if self.locked_until and datetime.utcnow() < self.locked_until:
            return True
        return False

    def is_overdue_for_checkin(self) -> bool:
        """Check if user is overdue for check-in"""
        if not self.last_check_in:
            return False

        deadline = self.last_check_in + \
            timedelta(days=self.check_in_interval + self.grace_period)
        return datetime.utcnow() > deadline

    def get_next_checkin_deadline(self) -> datetime:
        """Get the next check-in deadline"""
        if not self.last_check_in:
            return datetime.utcnow() + timedelta(days=self.check_in_interval)
        return self.last_check_in + timedelta(days=self.check_in_interval)


class UserProfile(SQLModel):
    """User profile for public display"""

    id: UUID
    email: str
    display_name: Optional[str]
    role: UserRole
    is_active: bool
    created_at: datetime
    last_check_in: Optional[datetime]
    subscription_tier: SubscriptionTier
    avatar_url: Optional[str]
    bio: Optional[str]

    class Config:
        arbitrary_types_allowed = True


class UserCreate(SQLModel):
    """User creation model"""

    email: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    display_name: Optional[str] = Field(default=None, max_length=150)
    role: UserRole = Field(default=UserRole.WRITER)
    timezone: Optional[str] = Field(default="UTC", max_length=50)
    language: Optional[str] = Field(default="en", max_length=10)

    class Config:
        arbitrary_types_allowed = True

    @validator('email')
    def validate_email(cls, v):
        try:
            EmailStr.validate(v)
        except ValueError:
            raise ValueError('Invalid email format')
        return v


class UserUpdate(SQLModel):
    """User update model"""

    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    display_name: Optional[str] = Field(default=None, max_length=150)
    bio: Optional[str] = Field(default=None, max_length=1000)
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    is_active: Optional[bool] = Field(default=None)
    subscription_tier: Optional[SubscriptionTier] = Field(default=None)
    check_in_interval: Optional[int] = Field(default=None, ge=1, le=365)
    grace_period: Optional[int] = Field(default=None, ge=1, le=30)
    timezone: Optional[str] = Field(default=None, max_length=50)
    language: Optional[str] = Field(default=None, max_length=10)
    notification_preferences: Optional[str] = Field(default=None)
    privacy_settings: Optional[str] = Field(default=None)

    class Config:
        arbitrary_types_allowed = True


class UserRoleUpdate(SQLModel):
    """User role update model"""

    role: UserRole
    reason: Optional[str] = Field(default=None, max_length=500)

    class Config:
        arbitrary_types_allowed = True


class UserPasswordUpdate(SQLModel):
    """User password update model"""

    current_password: str
    new_password: str = Field(min_length=8, max_length=128)

    class Config:
        arbitrary_types_allowed = True


class UserLogin(SQLModel):
    """User login model"""

    email: str = Field(max_length=255)
    password: str
    remember_me: bool = Field(default=False)
    two_factor_code: Optional[str] = Field(default=None, max_length=10)

    class Config:
        arbitrary_types_allowed = True

    @validator('email')
    def validate_email(cls, v):
        try:
            EmailStr.validate(v)
        except ValueError:
            raise ValueError('Invalid email format')
        return v


class UserCheckIn(SQLModel):
    """User check-in model"""

    # manual, automatic, vacation
    check_in_type: str = Field(default="manual", max_length=50)
    location: Optional[str] = Field(default=None, max_length=255)
    device_info: Optional[str] = Field(default=None, max_length=500)
    notes: Optional[str] = Field(default=None, max_length=1000)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)

    class Config:
        arbitrary_types_allowed = True


class UserSuspension(SQLModel):
    """User suspension model"""

    reason: str = Field(max_length=500)
    suspended_until: Optional[datetime] = Field(default=None)
    suspended_by: UUID = Field(foreign_key="user.id")
    notes: Optional[str] = Field(default=None, max_length=1000)

    class Config:
        arbitrary_types_allowed = True


class RoleChangeLog(SQLModel, table=True):
    """Log of role changes for audit purposes"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    old_role: UserRole
    new_role: UserRole
    changed_by: UUID = Field(foreign_key="user.id", index=True)
    changed_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    reason: Optional[str] = Field(default=None, max_length=500)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)

    # Relationships
    user: "User" = Relationship(
        back_populates="role_changes", sa_relationship_kwargs={"lazy": "selectin"})

    class Config:
        arbitrary_types_allowed = True


class UserPermission(SQLModel, table=True):
    """Granular permissions for users"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    # e.g., "message.create", "user.manage"
    permission: str = Field(max_length=100)
    granted_by: UUID = Field(foreign_key="user.id", index=True)
    granted_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    expires_at: Optional[datetime] = Field(default=None, index=True)
    is_active: bool = Field(default=True, index=True)

    # Relationships
    user: "User" = Relationship(
        back_populates="permissions", sa_relationship_kwargs={"lazy": "selectin"})

    class Config:
        arbitrary_types_allowed = True


class CheckIn(SQLModel, table=True):
    """User check-in records"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    # manual, automatic, vacation
    check_in_type: str = Field(max_length=50, index=True)
    location: Optional[str] = Field(default=None, max_length=255)
    device_info: Optional[str] = Field(default=None, max_length=500)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)
    notes: Optional[str] = Field(default=None, max_length=1000)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    expires_at: Optional[datetime] = Field(default=None, index=True)

    # Relationships
    user: "User" = Relationship(
        back_populates="check_ins", sa_relationship_kwargs={"lazy": "selectin"})

    class Config:
        arbitrary_types_allowed = True


class UserAuditLog(SQLModel, table=True):
    """Comprehensive audit log for user actions"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    # login, logout, password_change, etc.
    action: str = Field(max_length=100, index=True)
    # message, user, etc.
    resource_type: Optional[str] = Field(default=None, max_length=50)
    resource_id: Optional[UUID] = Field(default=None)
    details: Optional[str] = Field(default=None, max_length=1000)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    class Config:
        arbitrary_types_allowed = True


class UserSession(SQLModel, table=True):
    """User session management"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    session_token: str = Field(max_length=500, unique=True, index=True)
    refresh_token: str = Field(max_length=500, unique=True, index=True)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)
    is_active: bool = Field(default=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    expires_at: datetime = Field(index=True)
    last_used_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    class Config:
        arbitrary_types_allowed = True
