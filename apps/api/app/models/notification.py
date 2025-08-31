"""
Notification Models for Secret Safe Platform

Defines the database schema for storing user notifications including:
- Verification success/failure notifications
- System alerts
- User activity notifications
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from uuid import UUID

from sqlmodel import Field, SQLModel


class NotificationType(str, Enum):
    """Types of notifications"""
    VERIFICATION_SUCCESS = "verification_success"
    VERIFICATION_FAILURE = "verification_failure"
    VERIFICATION_REMINDER = "verification_reminder"
    SYSTEM_ALERT = "system_alert"
    USER_ACTIVITY = "user_activity"
    SECURITY_ALERT = "security_alert"
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"
    ACCOUNT_LOCKED = "account_locked"
    LOGIN_ATTEMPT = "login_attempt"


class NotificationStatus(str, Enum):
    """Status of notifications"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"
    CANCELLED = "cancelled"


class NotificationPriority(str, Enum):
    """Priority levels for notifications"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class NotificationChannel(str, Enum):
    """Delivery channels for notifications"""
    EMAIL = "email"
    IN_APP = "in_app"
    BOTH = "both"
    SMS = "sms"
    PUSH = "push"


class Notification(SQLModel, table=True):
    """Notification model for storing user notifications"""

    __tablename__ = "notifications"

    # Primary key
    id: UUID = Field(default=None, primary_key=True)

    # User relationship
    user_id: UUID = Field(foreign_key="users.id", index=True)

    # Notification content
    type: NotificationType = Field(index=True)
    title: str = Field(max_length=255)
    message: str = Field(max_length=1000)

    # Notification settings
    priority: NotificationPriority = Field(default=NotificationPriority.NORMAL)
    channel: NotificationChannel = Field(default=NotificationChannel.BOTH)
    status: NotificationStatus = Field(default=NotificationStatus.PENDING)

    # Notification data and additional information (stored as JSON string)
    notification_data: str = Field(default="{}", max_length=2000)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    sent_at: Optional[datetime] = Field(default=None)
    delivered_at: Optional[datetime] = Field(default=None)
    read_at: Optional[datetime] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None)

    # Delivery tracking
    delivery_attempts: int = Field(default=0)
    last_delivery_attempt: Optional[datetime] = Field(default=None)
    delivery_error: Optional[str] = Field(default=None)

    # User interaction tracking
    clicked_at: Optional[datetime] = Field(default=None)
    action_taken: Optional[str] = Field(default=None)

    class Config:
        """Pydantic configuration"""
        use_enum_values = True
        arbitrary_types_allowed = True


class NotificationCreate(SQLModel):
    """Model for creating new notifications"""

    user_id: UUID
    type: NotificationType
    title: str
    message: str
    priority: NotificationPriority = NotificationPriority.NORMAL
    channel: NotificationChannel = NotificationChannel.BOTH
    notification_data: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None


class NotificationUpdate(SQLModel):
    """Model for updating notifications"""

    title: Optional[str] = None
    message: Optional[str] = None
    priority: Optional[NotificationPriority] = None
    channel: Optional[NotificationChannel] = None
    status: Optional[NotificationStatus] = None
    notification_data: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None


class NotificationResponse(SQLModel):
    """Model for notification responses"""

    id: UUID
    user_id: UUID
    type: NotificationType
    title: str
    message: str
    priority: NotificationPriority
    channel: NotificationChannel
    status: NotificationStatus
    notification_data: str
    created_at: datetime
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    read_at: Optional[datetime]
    expires_at: Optional[datetime]
    delivery_attempts: int
    last_delivery_attempt: Optional[datetime]
    delivery_error: Optional[str]
    clicked_at: Optional[datetime]
    action_taken: Optional[str]


class NotificationPreferences(SQLModel, table=True):
    """User notification preferences"""

    __tablename__ = "notification_preferences"

    # Primary key
    id: UUID = Field(default=None, primary_key=True)

    # User relationship
    user_id: UUID = Field(foreign_key="users.id", unique=True, index=True)

    # Email preferences
    email_enabled: bool = Field(default=True)
    email_verification_success: bool = Field(default=True)
    email_verification_failure: bool = Field(default=True)
    email_verification_reminder: bool = Field(default=True)
    email_security_alerts: bool = Field(default=True)
    email_system_notifications: bool = Field(default=False)

    # In-app preferences
    in_app_enabled: bool = Field(default=True)
    in_app_verification_success: bool = Field(default=True)
    in_app_verification_failure: bool = Field(default=True)
    in_app_verification_reminder: bool = Field(default=True)
    in_app_security_alerts: bool = Field(default=True)
    in_app_system_notifications: bool = Field(default=True)

    # Frequency preferences
    reminder_frequency: str = Field(default="daily")  # daily, weekly, monthly
    quiet_hours_start: Optional[str] = Field(default="22:00")  # 24-hour format
    quiet_hours_end: Optional[str] = Field(default="08:00")  # 24-hour format

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """Pydantic configuration"""
        use_enum_values = True


class NotificationPreferencesUpdate(SQLModel):
    """Model for updating notification preferences"""

    email_enabled: Optional[bool] = None
    email_verification_success: Optional[bool] = None
    email_verification_failure: Optional[bool] = None
    email_verification_reminder: Optional[bool] = None
    email_security_alerts: Optional[bool] = None
    email_system_notifications: Optional[bool] = None

    in_app_enabled: Optional[bool] = None
    in_app_verification_success: Optional[bool] = None
    in_app_verification_failure: Optional[bool] = None
    in_app_verification_reminder: Optional[bool] = None
    in_app_security_alerts: Optional[bool] = None
    in_app_system_notifications: Optional[bool] = None

    reminder_frequency: Optional[str] = None
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None


class NotificationStatistics(SQLModel):
    """Model for notification statistics"""

    total_notifications: int
    unread_notifications: int
    notifications_by_type: Dict[str, int]
    notifications_by_status: Dict[str, int]
    notifications_by_priority: Dict[str, int]
    average_delivery_time: Optional[float] = None  # in seconds
    success_rate: Optional[float] = None  # percentage
    user_preferences: NotificationPreferences
