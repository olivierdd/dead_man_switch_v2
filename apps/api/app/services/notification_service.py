"""
Notification Service for Secret Safe Platform

Handles all types of notifications including:
- Verification success/failure notifications
- Email notifications
- In-app notifications
- System alerts
"""

import json
import logging
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from sqlmodel import Session, select

from ..models.database import get_db
from ..models.notification import (Notification, NotificationStatus,
                                   NotificationType)
from ..models.user import User
from ..services.email_service import EmailService
from ..settings import settings

logger = logging.getLogger(__name__)


class NotificationPriority(Enum):
    """Notification priority levels"""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class NotificationChannel(Enum):
    """Notification delivery channels"""

    EMAIL = "email"
    IN_APP = "in_app"
    BOTH = "both"


class NotificationService:
    """Service for managing all types of notifications"""

    def __init__(self):
        self.email_service = EmailService()
        self.settings = settings

    def _serialize_metadata(self, metadata: Dict[str, Any]) -> str:
        """Serialize metadata dict to JSON string"""
        try:
            return json.dumps(metadata, default=str)
        except Exception as e:
            logger.error(f"Failed to serialize metadata: {e}")
            return "{}"

    def _deserialize_metadata(self, metadata_str: str) -> Dict[str, Any]:
        """Deserialize JSON string to metadata dict"""
        try:
            if not metadata_str or metadata_str == "{}":
                return {}
            return json.loads(metadata_str)
        except Exception as e:
            logger.error(f"Failed to deserialize metadata: {e}")
            return {}

    async def send_verification_success_notification(
        self,
        user_id: UUID,
        verification_type: str = "email",
        additional_data: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Send verification success notification to user

        Args:
            user_id: ID of the verified user
            verification_type: Type of verification (email, phone, etc.)
            additional_data: Additional data for the notification

        Returns:
            bool: True if notification sent successfully
        """
        try:
            # Get user information
            with get_db() as db:
                user = db.exec(select(User).where(User.id == user_id)).first()
                if not user:
                    logger.error(f"User {user_id} not found for success notification")
                    return False

                # Prepare metadata
                metadata = {
                    "verification_type": verification_type,
                    "verified_at": datetime.now(timezone.utc).isoformat(),
                    **(additional_data or {}),
                }

                # Create notification record
                notification = Notification(
                    user_id=user_id,
                    type=NotificationType.VERIFICATION_SUCCESS,
                    title=f"{verification_type.title()} Verification Successful",
                    message=f"Your {verification_type} has been successfully verified. Welcome to Secret Safe!",
                    priority=NotificationPriority.NORMAL,
                    channel=NotificationChannel.BOTH,
                    status=NotificationStatus.PENDING,
                    notification_data=self._serialize_metadata(metadata),
                )

                db.add(notification)
                db.commit()
                db.refresh(notification)

                # Send email notification
                if notification.channel in [
                    NotificationChannel.EMAIL,
                    NotificationChannel.BOTH,
                ]:
                    await self._send_verification_success_email(user, notification)

                # Mark notification as sent
                notification.status = NotificationStatus.SENT
                notification.sent_at = datetime.now(timezone.utc)
                db.commit()

                logger.info(f"Verification success notification sent to user {user_id}")
                return True

        except Exception as e:
            logger.error(f"Failed to send verification success notification: {e}")
            return False

    async def send_verification_failure_notification(
        self,
        user_id: UUID,
        failure_reason: str,
        verification_type: str = "email",
        retry_available: bool = True,
        additional_data: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Send verification failure notification to user

        Args:
            user_id: ID of the user
            failure_reason: Reason for verification failure
            verification_type: Type of verification that failed
            retry_available: Whether retry is available
            additional_data: Additional data for the notification

        Returns:
            bool: True if notification sent successfully
        """
        try:
            # Get user information
            with get_db() as db:
                user = db.exec(select(User).where(User.id == user_id)).first()
                if not user:
                    logger.error(f"User {user_id} not found for failure notification")
                    return False

                # Prepare metadata
                metadata = {
                    "verification_type": verification_type,
                    "failure_reason": failure_reason,
                    "retry_available": retry_available,
                    "failed_at": datetime.now(timezone.utc).isoformat(),
                    **(additional_data or {}),
                }

                # Create notification record
                notification = Notification(
                    user_id=user_id,
                    type=NotificationType.VERIFICATION_FAILURE,
                    title=f"{verification_type.title()} Verification Failed",
                    message=f"Your {verification_type} verification failed: {failure_reason}",
                    priority=NotificationPriority.HIGH,
                    channel=NotificationChannel.BOTH,
                    status=NotificationStatus.PENDING,
                    notification_data=self._serialize_metadata(metadata),
                )

                db.add(notification)
                db.commit()
                db.refresh(notification)

                # Send email notification
                if notification.channel in [
                    NotificationChannel.EMAIL,
                    NotificationChannel.BOTH,
                ]:
                    await self._send_verification_failure_email(user, notification)

                # Mark notification as sent
                notification.status = NotificationStatus.SENT
                notification.sent_at = datetime.now(timezone.utc)
                db.commit()

                logger.info(f"Verification failure notification sent to user {user_id}")
                return True

        except Exception as e:
            logger.error(f"Failed to send verification failure notification: {e}")
            return False

    async def send_verification_reminder_notification(
        self,
        user_id: UUID,
        verification_type: str = "email",
        days_since_registration: int = 0,
        additional_data: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Send verification reminder notification to user

        Args:
            user_id: ID of the user
            verification_type: Type of verification needed
            days_since_registration: Days since user registration
            additional_data: Additional data for the notification

        Returns:
            bool: True if notification sent successfully
        """
        try:
            # Get user information
            with get_db() as db:
                user = db.exec(select(User).where(User.id == user_id)).first()
                if not user:
                    logger.error(f"User {user_id} not found for reminder notification")
                    return False

                # Prepare metadata
                metadata = {
                    "verification_type": verification_type,
                    "days_since_registration": days_since_registration,
                    "reminder_sent_at": datetime.now(timezone.utc).isoformat(),
                    **(additional_data or {}),
                }

                # Create notification record
                notification = Notification(
                    user_id=user_id,
                    type=NotificationType.VERIFICATION_REMINDER,
                    title="Complete Your Verification",
                    message=f"Please complete your {verification_type} verification to access all features",
                    priority=NotificationPriority.NORMAL,
                    channel=NotificationChannel.BOTH,
                    status=NotificationStatus.PENDING,
                    notification_data=self._serialize_metadata(metadata),
                )

                db.add(notification)
                db.commit()
                db.refresh(notification)

                # Send email notification
                if notification.channel in [
                    NotificationChannel.EMAIL,
                    NotificationChannel.BOTH,
                ]:
                    await self._send_verification_reminder_email(user, notification)

                # Mark notification as sent
                notification.status = NotificationStatus.SENT
                notification.sent_at = datetime.now(timezone.utc)
                db.commit()

                logger.info(
                    f"Verification reminder notification sent to user {user_id}"
                )
                return True

        except Exception as e:
            logger.error(f"Failed to send verification reminder notification: {e}")
            return False

    async def _send_verification_success_email(
        self, user: User, notification: Notification
    ) -> bool:
        """Send verification success email"""
        try:
            # Deserialize metadata for email service
            metadata = self._deserialize_metadata(notification.notification_data)

            # Use the existing email service to send the notification
            success = await self.email_service.send_verification_success_email(
                to_email=user.email,
                to_name=user.display_name or user.username,
                verification_type=metadata.get("verification_type", "email"),
                additional_data=metadata,
            )

            if success:
                logger.info(f"Verification success email sent to {user.email}")
            else:
                logger.warning(
                    f"Failed to send verification success email to {user.email}"
                )

            return success

        except Exception as e:
            logger.error(f"Error sending verification success email: {e}")
            return False

    async def _send_verification_failure_email(
        self, user: User, notification: Notification
    ) -> bool:
        """Send verification failure email"""
        try:
            # Deserialize metadata for email service
            metadata = self._deserialize_metadata(notification.notification_data)

            # Use the existing email service to send the notification
            success = await self.email_service.send_verification_failure_email(
                to_email=user.email,
                to_name=user.display_name or user.username,
                failure_reason=metadata.get("failure_reason", "Unknown error"),
                verification_type=metadata.get("verification_type", "email"),
                retry_available=metadata.get("retry_available", True),
                additional_data=metadata,
            )

            if success:
                logger.info(f"Verification failure email sent to {user.email}")
            else:
                logger.warning(
                    f"Failed to send verification failure email to {user.email}"
                )

            return success

        except Exception as e:
            logger.error(f"Error sending verification failure email: {e}")
            return False

    async def _send_verification_reminder_email(
        self, user: User, notification: Notification
    ) -> bool:
        """Send verification reminder email"""
        try:
            # Deserialize metadata for email service
            metadata = self._deserialize_metadata(notification.notification_data)

            # Use the existing email service to send the notification
            success = await self.email_service.send_verification_reminder_email(
                to_email=user.email,
                to_name=user.display_name or user.username,
                verification_type=metadata.get("verification_type", "email"),
                days_since_registration=metadata.get("days_since_registration", 0),
                additional_data=metadata,
            )

            if success:
                logger.info(f"Verification reminder email sent to {user.email}")
            else:
                logger.warning(
                    f"Failed to send verification reminder email to {user.email}"
                )

            return success

        except Exception as e:
            logger.error(f"Error sending verification reminder email: {e}")
            return False

    def get_user_notifications(
        self,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0,
        notification_type: Optional[NotificationType] = None,
        status: Optional[NotificationStatus] = None,
    ) -> List[Notification]:
        """Get notifications for a specific user"""
        try:
            with get_db() as db:
                query = select(Notification).where(Notification.user_id == user_id)

                if notification_type:
                    query = query.where(Notification.type == notification_type)

                if status:
                    query = query.where(Notification.status == status)

                query = query.order_by(Notification.created_at.desc())
                query = query.offset(offset).limit(limit)

                notifications = db.exec(query).all()
                return notifications

        except Exception as e:
            logger.error(f"Failed to get user notifications: {e}")
            return []

    def mark_notification_read(self, notification_id: UUID, user_id: UUID) -> bool:
        """Mark a notification as read"""
        try:
            with get_db() as db:
                notification = db.exec(
                    select(Notification).where(
                        Notification.id == notification_id,
                        Notification.user_id == user_id,
                    )
                ).first()

                if notification:
                    notification.read_at = datetime.now(timezone.utc)
                    db.commit()
                    return True

                return False

        except Exception as e:
            logger.error(f"Failed to mark notification as read: {e}")
            return False

    def get_notification_statistics(self, user_id: UUID) -> Dict[str, Any]:
        """Get notification statistics for a user"""
        try:
            with get_db() as db:
                total = db.exec(
                    select(Notification).where(Notification.user_id == user_id)
                ).count()

                unread = db.exec(
                    select(Notification).where(
                        Notification.user_id == user_id, Notification.read_at.is_(None)
                    )
                ).count()

                by_type = db.exec(
                    select(Notification.type, db.func.count(Notification.id))
                    .where(Notification.user_id == user_id)
                    .group_by(Notification.type)
                ).all()

                by_status = db.exec(
                    select(Notification.status, db.func.count(Notification.id))
                    .where(Notification.user_id == user_id)
                    .group_by(Notification.status)
                ).all()

                return {
                    "total": total,
                    "unread": unread,
                    "by_type": dict(by_type),
                    "by_status": dict(by_status),
                }

        except Exception as e:
            logger.error(f"Failed to get notification statistics: {e}")
            return {}
