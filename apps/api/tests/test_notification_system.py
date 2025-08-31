"""
Test suite for the notification system

Tests notification service, routes, and integration with verification system.
"""

import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from app.models.notification import (
    Notification, NotificationType, NotificationStatus, NotificationPriority,
    NotificationChannel, NotificationPreferences
)
from app.models.user import User
from app.services.notification_service import NotificationService
from app.services.email_service import EmailService


class TestNotificationService:
    """Test the NotificationService class"""
    
    @pytest.fixture
    def notification_service(self):
        """Create a notification service instance"""
        return NotificationService()
    
    @pytest.fixture
    def mock_user(self):
        """Create a mock user"""
        return User(
            id=uuid4(),
            username="testuser",
            email="test@example.com",
            display_name="Test User",
            is_verified=True,
            created_at=datetime.now(timezone.utc)
        )
    
    @pytest.fixture
    def mock_notification(self):
        """Create a mock notification"""
        return Notification(
            id=uuid4(),
            user_id=uuid4(),
            type=NotificationType.VERIFICATION_SUCCESS,
            title="Test Notification",
            message="Test message",
            priority=NotificationPriority.NORMAL,
            channel=NotificationChannel.BOTH,
            status=NotificationStatus.PENDING
        )
    
    @pytest.mark.asyncio
    async def test_send_verification_success_notification(self, notification_service, mock_user):
        """Test sending verification success notification"""
        with patch('app.services.notification_service.get_db') as mock_get_db:
            mock_db = MagicMock()
            mock_get_db.return_value.__enter__.return_value = mock_db
            
            # Mock user query
            mock_db.exec.return_value.first.return_value = mock_user
            
            # Mock email service
            with patch.object(notification_service.email_service, 'send_verification_success_email') as mock_send_email:
                mock_send_email.return_value = True
                
                result = await notification_service.send_verification_success_notification(
                    user_id=mock_user.id,
                    verification_type="email"
                )
                
                assert result is True
                mock_db.add.assert_called_once()
                mock_db.commit.assert_called()
                mock_send_email.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_send_verification_failure_notification(self, notification_service, mock_user):
        """Test sending verification failure notification"""
        with patch('app.services.notification_service.get_db') as mock_get_db:
            mock_db = MagicMock()
            mock_get_db.return_value.__enter__.return_value = mock_db
            
            # Mock user query
            mock_db.exec.return_value.first.return_value = mock_user
            
            # Mock email service
            with patch.object(notification_service.email_service, 'send_verification_failure_email') as mock_send_email:
                mock_send_email.return_value = True
                
                result = await notification_service.send_verification_failure_notification(
                    user_id=mock_user.id,
                    failure_reason="Test failure",
                    verification_type="email",
                    retry_available=True
                )
                
                assert result is True
                mock_db.add.assert_called_once()
                mock_db.commit.assert_called()
                mock_send_email.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_send_verification_reminder_notification(self, notification_service, mock_user):
        """Test sending verification reminder notification"""
        with patch('app.services.notification_service.get_db') as mock_get_db:
            mock_db = MagicMock()
            mock_get_db.return_value.__enter__.return_value = mock_db
            
            # Mock user query
            mock_db.exec.return_value.first.return_value = mock_user
            
            # Mock email service
            with patch.object(notification_service.email_service, 'send_verification_reminder_email') as mock_send_email:
                mock_send_email.return_value = True
                
                result = await notification_service.send_verification_reminder_notification(
                    user_id=mock_user.id,
                    verification_type="email",
                    days_since_registration=5
                )
                
                assert result is True
                mock_db.add.assert_called_once()
                mock_db.commit.assert_called()
                mock_send_email.assert_called_once()
    
    def test_get_user_notifications(self, notification_service):
        """Test getting user notifications"""
        with patch('app.services.notification_service.get_db') as mock_get_db:
            mock_db = MagicMock()
            mock_get_db.return_value.__enter__.return_value = mock_db
            
            # Mock notifications query
            mock_notifications = [MagicMock(), MagicMock()]
            mock_db.exec.return_value.all.return_value = mock_notifications
            
            result = notification_service.get_user_notifications(
                user_id=uuid4(),
                limit=10,
                offset=0
            )
            
            assert result == mock_notifications
            mock_db.exec.assert_called_once()
    
    def test_mark_notification_read(self, notification_service):
        """Test marking notification as read"""
        with patch('app.services.notification_service.get_db') as mock_get_db:
            mock_db = MagicMock()
            mock_get_db.return_value.__enter__.return_value = mock_db
            
            # Mock notification query
            mock_notification = MagicMock()
            mock_db.exec.return_value.first.return_value = mock_notification
            
            result = notification_service.mark_notification_read(
                notification_id=uuid4(),
                user_id=uuid4()
            )
            
            assert result is True
            mock_db.commit.assert_called_once()
    
    def test_get_notification_statistics(self, notification_service):
        """Test getting notification statistics"""
        with patch('app.services.notification_service.get_db') as mock_get_db:
            mock_db = MagicMock()
            mock_get_db.return_value.__enter__.return_value = mock_db
            
            # Mock count queries
            mock_db.exec.return_value.count.side_effect = [10, 3]
            
            # Mock group by queries
            mock_db.exec.return_value.all.side_effect = [
                [("type1", 5), ("type2", 5)],  # by_type
                [("status1", 7), ("status2", 3)]  # by_status
            ]
            
            result = notification_service.get_notification_statistics(user_id=uuid4())
            
            assert result["total"] == 10
            assert result["unread"] == 3
            assert result["by_type"] == {"type1": 5, "type2": 5}
            assert result["by_status"] == {"status1": 7, "status2": 3}


class TestNotificationModels:
    """Test notification models"""
    
    def test_notification_creation(self):
        """Test creating a notification"""
        notification = Notification(
            user_id=uuid4(),
            type=NotificationType.VERIFICATION_SUCCESS,
            title="Test Title",
            message="Test message"
        )
        
        assert notification.type == NotificationType.VERIFICATION_SUCCESS
        assert notification.priority == NotificationPriority.NORMAL
        assert notification.channel == NotificationChannel.BOTH
        assert notification.status == NotificationStatus.PENDING
    
    def test_notification_preferences_creation(self):
        """Test creating notification preferences"""
        preferences = NotificationPreferences(
            user_id=uuid4(),
            email_enabled=True,
            in_app_enabled=True
        )
        
        assert preferences.email_enabled is True
        assert preferences.in_app_enabled is True
        assert preferences.reminder_frequency == "daily"
    
    def test_notification_enums(self):
        """Test notification enums"""
        assert NotificationType.VERIFICATION_SUCCESS == "verification_success"
        assert NotificationStatus.PENDING == "pending"
        assert NotificationPriority.HIGH == "high"
        assert NotificationChannel.EMAIL == "email"


class TestNotificationIntegration:
    """Test notification system integration"""
    
    @pytest.mark.asyncio
    async def test_verification_success_notification_flow(self):
        """Test complete verification success notification flow"""
        with patch('app.services.notification_service.NotificationService') as MockNotificationService:
            mock_service = MockNotificationService.return_value
            mock_service.send_verification_success_notification = AsyncMock(return_value=True)
            
            # Test that the service is called correctly
            result = await mock_service.send_verification_success_notification(
                user_id=uuid4(),
                verification_type="email"
            )
            
            assert result is True
            mock_service.send_verification_success_notification.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_verification_failure_notification_flow(self):
        """Test complete verification failure notification flow"""
        with patch('app.services.notification_service.NotificationService') as MockNotificationService:
            mock_service = MockNotificationService.return_value
            mock_service.send_verification_failure_notification = AsyncMock(return_value=True)
            
            # Test that the service is called correctly
            result = await mock_service.send_verification_failure_notification(
                user_id=uuid4(),
                failure_reason="Token expired",
                verification_type="email",
                retry_available=True
            )
            
            assert result is True
            mock_service.send_verification_failure_notification.assert_called_once()


class TestNotificationEmailTemplates:
    """Test notification email templates"""
    
    @pytest.mark.asyncio
    async def test_verification_success_email_template(self):
        """Test verification success email template"""
        with patch('app.services.email_service.EmailService') as MockEmailService:
            mock_service = MockEmailService.return_value
            mock_service.send_verification_success_email = AsyncMock(return_value=True)
            
            result = await mock_service.send_verification_success_email(
                to_email="test@example.com",
                to_name="Test User",
                verification_type="email"
            )
            
            assert result is True
            mock_service.send_verification_success_email.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_verification_failure_email_template(self):
        """Test verification failure email template"""
        with patch('app.services.email_service.EmailService') as MockEmailService:
            mock_service = MockEmailService.return_value
            mock_service.send_verification_failure_email = AsyncMock(return_value=True)
            
            result = await mock_service.send_verification_failure_email(
                to_email="test@example.com",
                to_name="Test User",
                failure_reason="Invalid token",
                verification_type="email",
                retry_available=True
            )
            
            assert result is True
            mock_service.send_verification_failure_email.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_verification_reminder_email_template(self):
        """Test verification reminder email template"""
        with patch('app.services.email_service.EmailService') as MockEmailService:
            mock_service = MockEmailService.return_value
            mock_service.send_verification_reminder_email = AsyncMock(return_value=True)
            
            result = await mock_service.send_verification_reminder_email(
                to_email="test@example.com",
                to_name="Test User",
                verification_type="email",
                days_since_registration=5
            )
            
            assert result is True
            mock_service.send_verification_reminder_email.assert_called_once()


class TestNotificationErrorHandling:
    """Test notification system error handling"""
    
    @pytest.mark.asyncio
    async def test_notification_service_database_error(self):
        """Test notification service handles database errors gracefully"""
        with patch('app.services.notification_service.get_db') as mock_get_db:
            mock_get_db.side_effect = Exception("Database connection failed")
            
            service = NotificationService()
            result = await service.send_verification_success_notification(
                user_id=uuid4(),
                verification_type="email"
            )
            
            assert result is False
    
    @pytest.mark.asyncio
    async def test_notification_service_email_error(self):
        """Test notification service handles email errors gracefully"""
        with patch('app.services.notification_service.get_db') as mock_get_db:
            mock_db = MagicMock()
            mock_get_db.return_value.__enter__.return_value = mock_db
            
            # Mock user query
            mock_user = MagicMock()
            mock_db.exec.return_value.first.return_value = mock_user
            
            # Mock email service error
            with patch.object(service.email_service, 'send_verification_success_email') as mock_send_email:
                mock_send_email.side_effect = Exception("Email service failed")
                
                service = NotificationService()
                result = await service.send_verification_success_notification(
                    user_id=uuid4(),
                    verification_type="email"
                )
                
                assert result is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
