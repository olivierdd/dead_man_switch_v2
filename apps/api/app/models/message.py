"""
Message models for Secret Safe API
Dead man's switch functionality with role-based access
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum


class MessageStatus(str, Enum):
    """Message status enumeration"""
    DRAFT = "draft"
    ACTIVE = "active"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class DissolutionAction(str, Enum):
    """Company dissolution action types"""
    DESTROY = "destroy"
    RELEASE = "release"
    ALTERNATIVE = "alternative"
    TRANSFER = "transfer"
    EXTEND = "extend"


class Message(SQLModel, table=True):
    """Main message model for dead man's switch"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)

    # Content (encrypted)
    encrypted_content: bytes
    encrypted_key: bytes
    content_hash: str = Field(max_length=64)  # SHA-256 hash for verification

    # Message metadata
    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=500)

    # Check-in configuration
    check_in_interval: int = Field(default=7)  # days
    grace_period: int = Field(default=3)  # days
    last_check_in: Optional[datetime] = Field(default=None)
    next_check_in_deadline: Optional[datetime] = Field(default=None)

    # Status and lifecycle
    status: MessageStatus = Field(default=MessageStatus.DRAFT, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    activated_at: Optional[datetime] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None)

    # Security
    requires_password: bool = Field(default=False)
    password_hash: Optional[str] = Field(default=None, max_length=255)
    max_access_attempts: int = Field(default=3)
    access_attempts: int = Field(default=0)

    # Blockchain and IPFS (Ultimate tier)
    ipfs_hash: Optional[str] = Field(default=None, max_length=64)
    arweave_hash: Optional[str] = Field(default=None, max_length=64)
    blockchain_registry_id: Optional[str] = Field(default=None, max_length=100)
    has_decentralized_backup: bool = Field(default=False)

    # Dissolution planning
    dissolution_action: DissolutionAction = Field(
        default=DissolutionAction.RELEASE)
    alternative_message_hash: Optional[str] = Field(
        default=None, max_length=64)
    backup_owner_email: Optional[str] = Field(default=None, max_length=255)
    extended_grace_period: Optional[int] = Field(default=None)

    # Sharing and access control
    is_shared: bool = Field(default=False)
    shared_with_readers: List["MessageShare"] = Relationship(
        back_populates="message")

    # Recipients
    recipients: List["Recipient"] = Relationship(back_populates="message")

    # Relationships
    user: "User" = Relationship(back_populates="messages")

    class Config:
        arbitrary_types_allowed = True


class MessageShare(SQLModel, table=True):
    """Tracks messages shared with Reader users"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    message_id: UUID = Field(foreign_key="message.id", index=True)
    shared_with_user_id: UUID = Field(foreign_key="user.id", index=True)
    shared_by_user_id: UUID = Field(foreign_key="user.id")

    # Access control
    # read, download, comment
    access_level: str = Field(default="read", max_length=50)
    can_download: bool = Field(default=False)
    can_comment: bool = Field(default=False)

    # Timestamps
    shared_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = Field(default=None)

    # Relationships
    message: Message = Relationship(back_populates="shared_with_readers")
    shared_with_user: "User" = Relationship(back_populates="shared_messages")


class Recipient(SQLModel, table=True):
    """Message recipients for delivery"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    message_id: UUID = Field(foreign_key="message.id", index=True)

    # Recipient information
    email: str = Field(max_length=255, index=True)
    name: str = Field(max_length=150)

    # Access control
    access_token: str = Field(unique=True, index=True, max_length=255)
    token_expiry: datetime
    delivered_at: Optional[datetime] = Field(default=None)
    accessed_at: Optional[datetime] = Field(default=None)
    access_count: int = Field(default=0)

    # Delivery tracking
    delivery_attempts: int = Field(default=0)
    last_delivery_attempt: Optional[datetime] = Field(default=None)
    # pending, delivered, failed
    delivery_status: str = Field(default="pending", max_length=50)

    # Relationships
    message: Message = Relationship(back_populates="recipients")


class DissolutionPlan(SQLModel, table=True):
    """Company dissolution contingency planning"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    message_id: UUID = Field(foreign_key="message.id", index=True)

    # Plan configuration
    primary_action: DissolutionAction
    alternative_message_hash: Optional[str] = Field(
        default=None, max_length=64)
    backup_owner_email: Optional[str] = Field(default=None, max_length=255)
    extended_grace_period: Optional[int] = Field(default=None)

    # Trigger conditions
    trigger_method: str = Field(default="company_announcement", max_length=100)
    auto_release_delay: Optional[int] = Field(default=None)  # days

    # Notification preferences
    notify_on_dissolution: bool = Field(default=True)
    dissolution_notification_email: Optional[str] = Field(
        default=None, max_length=255)

    # Emergency contacts
    emergency_contacts: str = Field(
        default="[]")  # JSON string of email addresses

    # Execution tracking
    executed: bool = Field(default=False)
    executed_at: Optional[datetime] = Field(default=None)
    executed_by: Optional[str] = Field(default=None, max_length=100)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Pydantic models for API requests/responses


class MessageCreate(SQLModel):
    """Message creation model"""

    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=500)
    content: str = Field(min_length=1, max_length=50000)  # Will be encrypted
    check_in_interval: int = Field(default=7, ge=1, le=365)
    grace_period: int = Field(default=3, ge=1, le=30)
    requires_password: bool = Field(default=False)
    password: Optional[str] = Field(default=None, min_length=1, max_length=128)

    # Recipients
    recipients: List["RecipientCreate"] = Field(min_items=1, max_items=10)

    # Dissolution planning
    dissolution_action: DissolutionAction = Field(
        default=DissolutionAction.RELEASE)
    alternative_message: Optional[str] = Field(default=None, max_length=50000)
    backup_owner_email: Optional[str] = Field(default=None, max_length=255)
    extended_grace_period: Optional[int] = Field(default=None, ge=1, le=365)


class MessageUpdate(SQLModel):
    """Message update model"""

    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=500)
    check_in_interval: Optional[int] = Field(default=None, ge=1, le=365)
    grace_period: Optional[int] = Field(default=None, ge=1, le=30)
    requires_password: Optional[bool] = Field(default=None)
    password: Optional[str] = Field(default=None, min_length=1, max_length=128)


class MessageShareCreate(SQLModel):
    """Message sharing model"""

    reader_email: str = Field(max_length=255)
    access_level: str = Field(default="read", max_length=50)
    can_download: bool = Field(default=False)
    can_comment: bool = Field(default=False)
    expires_at: Optional[datetime] = Field(default=None)


class RecipientCreate(SQLModel):
    """Recipient creation model"""

    email: str = Field(max_length=255)
    name: str = Field(max_length=150)


class MessageResponse(SQLModel):
    """Message response model (encrypted content not included)"""

    id: UUID
    title: Optional[str]
    description: Optional[str]
    status: MessageStatus
    check_in_interval: int
    grace_period: int
    last_check_in: Optional[datetime]
    next_check_in_deadline: Optional[datetime]
    created_at: datetime
    activated_at: Optional[datetime]
    expires_at: Optional[datetime]
    requires_password: bool
    has_decentralized_backup: bool
    dissolution_action: DissolutionAction
    is_shared: bool
    recipients_count: int

    class Config:
        arbitrary_types_allowed = True


class MessageCheckIn(SQLModel):
    """Message check-in model"""

    message_id: UUID
    method: str = Field(default="web", max_length=50)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)
