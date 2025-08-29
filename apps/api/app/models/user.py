"""
User models for Secret Safe API
Role-based access control implementation
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User roles for access control"""
    ADMIN = "admin"
    WRITER = "writer"
    READER = "reader"


class User(SQLModel, table=True):
    """User model with role-based permissions"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    role: UserRole = Field(default=UserRole.WRITER, index=True)

    # Profile information
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    display_name: Optional[str] = Field(default=None, max_length=150)

    # Account status
    is_active: bool = Field(default=True, index=True)
    is_suspended: bool = Field(default=False, index=True)
    is_verified: bool = Field(default=False, index=True)

    # Subscription and billing
    subscription_tier: str = Field(default="free", max_length=50)
    subscription_expires_at: Optional[datetime] = Field(default=None)

    # Check-in system
    last_check_in: Optional[datetime] = Field(default=None)
    check_in_interval: int = Field(default=7)  # days
    grace_period: int = Field(default=3)  # days
    vacation_mode_until: Optional[datetime] = Field(default=None)

    # Security
    two_factor_enabled: bool = Field(default=False)
    two_factor_secret: Optional[str] = Field(default=None)
    failed_login_attempts: int = Field(default=0)
    locked_until: Optional[datetime] = Field(default=None)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: Optional[datetime] = Field(default=None)

    # Role management
    created_by: Optional[UUID] = Field(default=None, foreign_key="user.id")
    role_changed_by: Optional[UUID] = Field(
        default=None, foreign_key="user.id")
    role_changed_at: Optional[datetime] = Field(default=None)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="user")
    shared_messages: List["MessageShare"] = Relationship(
        back_populates="shared_with_user")
    check_ins: List["CheckIn"] = Relationship(back_populates="user")
    role_changes: List["RoleChangeLog"] = Relationship(back_populates="user")
    permissions: List["UserPermission"] = Relationship(back_populates="user")

    class Config:
        arbitrary_types_allowed = True


class UserProfile(SQLModel):
    """User profile for public display"""

    id: UUID
    email: str
    display_name: Optional[str]
    role: UserRole
    is_active: bool
    created_at: datetime
    last_check_in: Optional[datetime]

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
    subscription_tier: str = Field(default="free")


class UserUpdate(SQLModel):
    """User update model"""

    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    display_name: Optional[str] = Field(default=None, max_length=150)
    check_in_interval: Optional[int] = Field(default=None, ge=1, le=365)
    grace_period: Optional[int] = Field(default=None, ge=1, le=30)
    vacation_mode_until: Optional[datetime] = Field(default=None)


class UserRoleUpdate(SQLModel):
    """User role update model (admin only)"""

    role: UserRole
    reason: Optional[str] = Field(default=None, max_length=500)


class UserPasswordUpdate(SQLModel):
    """User password update model"""

    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class UserLogin(SQLModel):
    """User login model"""

    email: str = Field(max_length=255)
    password: str = Field(max_length=128)


class UserCheckIn(SQLModel):
    """User check-in model"""

    method: str = Field(default="web", max_length=50)  # web, email, api
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)


class UserSuspension(SQLModel):
    """User suspension model (admin only)"""

    is_suspended: bool
    reason: Optional[str] = Field(default=None, max_length=500)
    suspended_until: Optional[datetime] = Field(default=None)

# Additional models for role management


class RoleChangeLog(SQLModel, table=True):
    """Audit trail for role changes"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    old_role: UserRole
    new_role: UserRole
    changed_by: UUID = Field(foreign_key="user.id")
    reason: Optional[str] = Field(default=None, max_length=500)
    changed_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: User = Relationship(back_populates="role_changes")


class UserPermission(SQLModel, table=True):
    """Custom permissions beyond role defaults"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    # e.g., "messages.create", "admin.users.view"
    permission: str = Field(max_length=100)
    granted: bool = Field(default=True)
    granted_by: UUID = Field(foreign_key="user.id")
    granted_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(default=None)

    # Relationships
    user: User = Relationship(back_populates="permissions")


class CheckIn(SQLModel, table=True):
    """User check-in history"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    method: str = Field(max_length=50)  # web, email, api
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)

    # Relationships
    user: User = Relationship(back_populates="check_ins")
