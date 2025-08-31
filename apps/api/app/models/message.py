"""
Message models for Secret Safe API
Dead man's switch functionality with role-based access
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import TYPE_CHECKING, Any, Dict, List, Optional
from uuid import UUID, uuid4

from pydantic import EmailStr, validator
from sqlmodel import Field, Relationship, SQLModel

# Use TYPE_CHECKING to avoid circular imports
if TYPE_CHECKING:
    from .user import User


class MessageStatus(str, Enum):
    """Message status enumeration"""

    DRAFT = "draft"
    ACTIVE = "active"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    SCHEDULED = "scheduled"
    PAUSED = "paused"


class DissolutionAction(str, Enum):
    """Company dissolution action types"""

    DESTROY = "destroy"
    RELEASE = "release"
    ALTERNATIVE = "alternative"
    TRANSFER = "transfer"
    EXTEND = "extend"
    NOTIFY = "notify"


class MessagePriority(str, Enum):
    """Message priority levels"""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"
    CRITICAL = "critical"


class MessageType(str, Enum):
    """Message types for different use cases"""

    PERSONAL = "personal"
    BUSINESS = "business"
    LEGAL = "legal"
    FINANCIAL = "financial"
    MEDICAL = "medical"
    TECHNICAL = "technical"
    EMERGENCY = "emergency"


class Message(SQLModel, table=True):
    """Main message model for dead man's switch"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)

    # Content (encrypted)
    encrypted_content: bytes
    encrypted_key: bytes
    # SHA-256 hash for verification
    content_hash: str = Field(max_length=64, index=True)
    content_size: int = Field(default=0)  # Size in bytes

    # Message metadata
    title: Optional[str] = Field(default=None, max_length=200, index=True)
    description: Optional[str] = Field(default=None, max_length=500)
    message_type: MessageType = Field(default=MessageType.PERSONAL, index=True)
    priority: MessagePriority = Field(default=MessagePriority.NORMAL, index=True)
    tags: str = Field(default="[]")  # JSON array of tags

    # Check-in configuration
    check_in_interval: int = Field(default=7, ge=1, le=365, index=True)  # days
    grace_period: int = Field(default=3, ge=1, le=30, index=True)  # days
    last_check_in: Optional[datetime] = Field(default=None, index=True)
    next_check_in_deadline: Optional[datetime] = Field(default=None, index=True)
    auto_check_in_enabled: bool = Field(default=True)

    # Status and lifecycle
    status: MessageStatus = Field(default=MessageStatus.DRAFT, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    activated_at: Optional[datetime] = Field(default=None, index=True)
    expires_at: Optional[datetime] = Field(default=None, index=True)
    scheduled_for: Optional[datetime] = Field(default=None, index=True)
    delivered_at: Optional[datetime] = Field(default=None, index=True)

    # Security
    requires_password: bool = Field(default=False, index=True)
    password_hash: Optional[str] = Field(default=None, max_length=255)
    max_access_attempts: int = Field(default=3)
    access_attempts: int = Field(default=0)
    access_log: str = Field(default="[]")  # JSON array of access attempts
    encryption_algorithm: str = Field(default="AES-256-GCM", max_length=50)

    # Blockchain and IPFS (Ultimate tier)
    ipfs_hash: Optional[str] = Field(default=None, max_length=64, index=True)
    arweave_hash: Optional[str] = Field(default=None, max_length=64, index=True)
    blockchain_registry_id: Optional[str] = Field(default=None, max_length=100)
    has_decentralized_backup: bool = Field(default=False, index=True)
    blockchain_tx_hash: Optional[str] = Field(default=None, max_length=66)

    # Dissolution planning
    dissolution_action: DissolutionAction = Field(
        default=DissolutionAction.RELEASE, index=True
    )
    alternative_message_hash: Optional[str] = Field(default=None, max_length=64)
    backup_owner_email: Optional[str] = Field(default=None, max_length=255)
    extended_grace_period: Optional[int] = Field(default=None, ge=1, le=365)
    dissolution_conditions: str = Field(default="{}")  # JSON object of conditions

    # Sharing and access control
    is_shared: bool = Field(default=False, index=True)
    shared_with_readers: List["MessageShare"] = Relationship(
        back_populates="message", sa_relationship_kwargs={"lazy": "selectin"}
    )

    # Recipients
    recipients: List["Recipient"] = Relationship(
        back_populates="message", sa_relationship_kwargs={"lazy": "selectin"}
    )

    # Attachments
    has_attachments: bool = Field(default=False, index=True)
    attachment_count: int = Field(default=0)
    total_attachment_size: int = Field(default=0)  # bytes

    # Analytics
    view_count: int = Field(default=0, index=True)
    last_viewed_at: Optional[datetime] = Field(default=None, index=True)
    delivery_success_rate: float = Field(default=0.0)  # percentage

    # Relationships - using forward references to avoid circular imports
    user: "User" = Relationship(
        back_populates="messages", sa_relationship_kwargs={"lazy": "selectin"}
    )

    # Dissolution plans
    dissolution_plans: List["DissolutionPlan"] = Relationship(
        back_populates="message",
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "DissolutionPlan.message_id",
        },
    )
    alternative_dissolution_plans: List["DissolutionPlan"] = Relationship(
        back_populates="alternative_message",
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "DissolutionPlan.alternative_message_id",
        },
    )

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat(), UUID: lambda v: str(v)}

    @validator("check_in_interval", "grace_period")
    def validate_intervals(cls, v):
        if v < 1:
            raise ValueError("Interval must be at least 1 day")
        return v

    @validator("backup_owner_email")
    def validate_backup_email(cls, v):
        if v is not None:
            try:
                EmailStr.validate(v)
            except ValueError:
                raise ValueError("Invalid backup owner email format")
        return v

    def is_overdue_for_checkin(self) -> bool:
        """Check if message is overdue for check-in"""
        if not self.last_check_in or self.status != MessageStatus.ACTIVE:
            return False

        deadline = self.last_check_in + timedelta(
            days=self.check_in_interval + self.grace_period
        )
        return datetime.utcnow() > deadline

    def get_next_checkin_deadline(self) -> datetime:
        """Get the next check-in deadline"""
        if not self.last_check_in:
            return datetime.utcnow() + timedelta(days=self.check_in_interval)
        return self.last_check_in + timedelta(days=self.check_in_interval)

    def should_trigger_dissolution(self) -> bool:
        """Check if dissolution should be triggered"""
        if self.status != MessageStatus.ACTIVE:
            return False

        if self.is_overdue_for_checkin():
            return True

        return False


class MessageShare(SQLModel, table=True):
    """Tracks messages shared with Reader users"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    message_id: UUID = Field(foreign_key="message.id", index=True)
    shared_with_user_id: UUID = Field(foreign_key="user.id", index=True)
    shared_by_user_id: UUID = Field(foreign_key="user.id", index=True)
    shared_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    expires_at: Optional[datetime] = Field(default=None, index=True)
    access_count: int = Field(default=0, index=True)
    last_accessed: Optional[datetime] = Field(default=None, index=True)

    # Permissions
    can_view: bool = Field(default=True)
    can_download: bool = Field(default=False)
    can_share: bool = Field(default=False)
    can_comment: bool = Field(default=False)

    # Security
    requires_approval: bool = Field(default=False)
    approved_at: Optional[datetime] = Field(default=None)
    approved_by: Optional[UUID] = Field(default=None, foreign_key="user.id")

    # Notifications
    notify_on_access: bool = Field(default=True)
    notify_on_expiry: bool = Field(default=True)

    # Relationships
    message: "Message" = Relationship(
        back_populates="shared_with_readers",
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    shared_with_user: "User" = Relationship(
        back_populates="shared_messages",
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "MessageShare.shared_with_user_id",
        },
    )
    shared_by_user: "User" = Relationship(
        back_populates="shared_by_messages",
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "MessageShare.shared_by_user_id",
        },
    )
    approved_by_user: Optional["User"] = Relationship(
        back_populates="approved_message_shares",
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "MessageShare.approved_by",
        },
    )

    class Config:
        arbitrary_types_allowed = True


class Recipient(SQLModel, table=True):
    """Message recipients for delivery"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    message_id: UUID = Field(foreign_key="message.id", index=True)
    email: str = Field(max_length=255, index=True)
    name: Optional[str] = Field(default=None, max_length=150)
    phone: Optional[str] = Field(default=None, max_length=20)
    # email, sms, both, webhook
    delivery_method: str = Field(default="email", max_length=50, index=True)
    # pending, sent, delivered, failed, bounced
    delivery_status: str = Field(default="pending", max_length=50, index=True)
    sent_at: Optional[datetime] = Field(default=None, index=True)
    delivered_at: Optional[datetime] = Field(default=None, index=True)
    failure_reason: Optional[str] = Field(default=None, max_length=500)
    retry_count: int = Field(default=0, index=True)
    max_retries: int = Field(default=3)

    # Delivery preferences
    preferred_time: Optional[str] = Field(default=None, max_length=10)  # HH:MM format
    timezone: str = Field(default="UTC", max_length=50)
    language: str = Field(default="en", max_length=10)

    # Security
    requires_confirmation: bool = Field(default=False)
    confirmation_token: Optional[str] = Field(default=None, max_length=100)
    confirmed_at: Optional[datetime] = Field(default=None)

    # Analytics
    open_count: int = Field(default=0)
    click_count: int = Field(default=0)
    last_opened_at: Optional[datetime] = Field(default=None)

    # Relationships
    message: "Message" = Relationship(
        back_populates="recipients", sa_relationship_kwargs={"lazy": "selectin"}
    )

    class Config:
        arbitrary_types_allowed = True

    @validator("email")
    def validate_email(cls, v):
        try:
            EmailStr.validate(v)
        except ValueError:
            raise ValueError("Invalid recipient email format")
        return v


class DissolutionPlan(SQLModel, table=True):
    """Company dissolution contingency plans"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    message_id: UUID = Field(foreign_key="message.id", index=True)
    company_name: str = Field(max_length=200, index=True)
    dissolution_date: datetime = Field(index=True)
    action_type: DissolutionAction = Field(index=True)
    alternative_message_id: Optional[UUID] = Field(
        default=None, foreign_key="message.id"
    )
    backup_owner_email: str = Field(max_length=255)
    # JSON string of contact info
    emergency_contacts: str = Field(default="[]")
    # JSON string of document hashes
    legal_documents: str = Field(default="[]")
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Additional fields
    company_registration_number: Optional[str] = Field(default=None, max_length=100)
    legal_entity_type: Optional[str] = Field(default=None, max_length=100)
    jurisdiction: Optional[str] = Field(default=None, max_length=100)
    tax_id: Optional[str] = Field(default=None, max_length=100)

    # Execution tracking
    execution_status: str = Field(default="pending", max_length=50, index=True)
    executed_at: Optional[datetime] = Field(default=None)
    executed_by: Optional[UUID] = Field(default=None, foreign_key="user.id")
    execution_notes: Optional[str] = Field(default=None, max_length=1000)

    # Relationships
    message: "Message" = Relationship(
        back_populates="dissolution_plans",
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "DissolutionPlan.message_id",
        },
    )
    alternative_message: Optional["Message"] = Relationship(
        back_populates="alternative_dissolution_plans",
        sa_relationship_kwargs={
            "lazy": "selectin",
            "foreign_keys": "DissolutionPlan.alternative_message_id",
        },
    )

    class Config:
        arbitrary_types_allowed = True

    @validator("backup_owner_email")
    def validate_backup_email(cls, v):
        try:
            EmailStr.validate(v)
        except ValueError:
            raise ValueError("Invalid backup owner email format")
        return v


class MessageAttachment(SQLModel, table=True):
    """Message attachments"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    message_id: UUID = Field(foreign_key="message.id", index=True)
    filename: str = Field(max_length=255, index=True)
    original_filename: str = Field(max_length=255)
    file_size: int = Field(index=True)  # bytes
    mime_type: str = Field(max_length=100, index=True)
    file_hash: str = Field(max_length=64, index=True)  # SHA-256

    # Storage
    storage_path: str = Field(max_length=500)
    storage_provider: str = Field(max_length=50)  # local, s3, ipfs, etc.
    is_encrypted: bool = Field(default=True, index=True)

    # Access control
    requires_password: bool = Field(default=False)
    password_hash: Optional[str] = Field(default=None, max_length=255)
    max_downloads: Optional[int] = Field(default=None)
    download_count: int = Field(default=0, index=True)

    # Metadata
    description: Optional[str] = Field(default=None, max_length=500)
    tags: str = Field(default="[]")  # JSON array
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    expires_at: Optional[datetime] = Field(default=None, index=True)

    class Config:
        arbitrary_types_allowed = True


class MessageAuditLog(SQLModel, table=True):
    """Audit log for message actions"""

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    message_id: UUID = Field(foreign_key="message.id", index=True)
    user_id: Optional[UUID] = Field(default=None, foreign_key="user.id", index=True)
    # view, edit, share, deliver, etc.
    action: str = Field(max_length=100, index=True)
    details: Optional[str] = Field(default=None, max_length=1000)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Resource tracking
    resource_type: str = Field(default="message", max_length=50)
    resource_action: str = Field(max_length=100)  # specific action performed
    old_value: Optional[str] = Field(default=None, max_length=1000)
    new_value: Optional[str] = Field(default=None, max_length=1000)

    class Config:
        arbitrary_types_allowed = True


# Pydantic models for API operations
class MessageCreate(SQLModel):
    """Message creation model"""

    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=500)
    content: str  # Will be encrypted before storage
    message_type: MessageType = Field(default=MessageType.PERSONAL)
    priority: MessagePriority = Field(default=MessagePriority.NORMAL)
    tags: List[str] = Field(default=[])
    check_in_interval: int = Field(default=7, ge=1, le=365)
    grace_period: int = Field(default=3, ge=1, le=30)
    requires_password: bool = Field(default=False)
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)
    dissolution_action: DissolutionAction = Field(default=DissolutionAction.RELEASE)
    recipients: List[str] = Field(default=[])  # List of email addresses
    scheduled_for: Optional[datetime] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None)

    class Config:
        arbitrary_types_allowed = True

    @validator("recipients")
    def validate_recipient_emails(cls, v):
        for email in v:
            try:
                EmailStr.validate(email)
            except ValueError:
                raise ValueError(f"Invalid recipient email format: {email}")
        return v


class MessageUpdate(SQLModel):
    """Message update model"""

    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=500)
    message_type: Optional[MessageType] = Field(default=None)
    priority: Optional[MessagePriority] = Field(default=None)
    tags: Optional[List[str]] = Field(default=None)
    check_in_interval: Optional[int] = Field(default=None, ge=1, le=365)
    grace_period: Optional[int] = Field(default=None, ge=1, le=30)
    requires_password: Optional[bool] = Field(default=None)
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)
    dissolution_action: Optional[DissolutionAction] = Field(default=None)
    scheduled_for: Optional[datetime] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None)

    class Config:
        arbitrary_types_allowed = True


class MessageShareCreate(SQLModel):
    """Message sharing model"""

    message_id: UUID
    shared_with_emails: List[str] = Field(default=[])
    expires_at: Optional[datetime] = Field(default=None)
    permissions: Dict[str, bool] = Field(default_factory=dict)
    requires_approval: bool = Field(default=False)
    notify_on_access: bool = Field(default=True)

    class Config:
        arbitrary_types_allowed = True

    @validator("shared_with_emails")
    def validate_shared_emails(cls, v):
        for email in v:
            try:
                EmailStr.validate(email)
            except ValueError:
                raise ValueError(f"Invalid shared email format: {email}")
        return v


class RecipientCreate(SQLModel):
    """Recipient creation model"""

    email: str = Field(max_length=255)
    name: Optional[str] = Field(default=None, max_length=150)
    phone: Optional[str] = Field(default=None, max_length=20)
    delivery_method: str = Field(default="email", max_length=50)
    preferred_time: Optional[str] = Field(default=None, max_length=10)
    timezone: Optional[str] = Field(default="UTC", max_length=50)
    language: Optional[str] = Field(default="en", max_length=10)
    requires_confirmation: bool = Field(default=False)

    class Config:
        arbitrary_types_allowed = True

    @validator("email")
    def validate_email(cls, v):
        try:
            EmailStr.validate(v)
        except ValueError:
            raise ValueError("Invalid recipient email format")
        return v


class MessageResponse(SQLModel):
    """Message response model"""

    id: UUID
    title: Optional[str]
    description: Optional[str]
    message_type: MessageType
    priority: MessagePriority
    status: MessageStatus
    created_at: datetime
    activated_at: Optional[datetime]
    expires_at: Optional[datetime]
    scheduled_for: Optional[datetime]
    check_in_interval: int
    grace_period: int
    last_check_in: Optional[datetime]
    next_check_in_deadline: Optional[datetime]
    is_shared: bool
    recipient_count: int
    has_attachments: bool
    attachment_count: int
    view_count: int
    tags: List[str]

    class Config:
        arbitrary_types_allowed = True


class MessageCheckIn(SQLModel):
    """Message check-in model"""

    message_id: UUID
    # manual, automatic, vacation
    check_in_type: str = Field(default="manual", max_length=50)
    location: Optional[str] = Field(default=None, max_length=255)
    device_info: Optional[str] = Field(default=None, max_length=500)
    notes: Optional[str] = Field(default=None, max_length=1000)
    ip_address: Optional[str] = Field(default=None, max_length=45)
    user_agent: Optional[str] = Field(default=None, max_length=500)

    class Config:
        arbitrary_types_allowed = True


class MessageSearch(SQLModel):
    """Message search parameters"""

    query: Optional[str] = Field(default=None, max_length=200)
    status: Optional[MessageStatus] = Field(default=None)
    message_type: Optional[MessageType] = Field(default=None)
    priority: Optional[MessagePriority] = Field(default=None)
    tags: Optional[List[str]] = Field(default=None)
    created_after: Optional[datetime] = Field(default=None)
    created_before: Optional[datetime] = Field(default=None)
    has_attachments: Optional[bool] = Field(default=None)
    is_shared: Optional[bool] = Field(default=None)
    limit: int = Field(default=50, ge=1, le=100)
    offset: int = Field(default=0, ge=0)

    class Config:
        arbitrary_types_allowed = True
