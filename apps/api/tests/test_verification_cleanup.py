"""
Tests for verification token cleanup functionality

Tests the TokenCleanupService, Celery tasks, and admin endpoints
for cleaning up expired verification tokens.
"""

import asyncio
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, Mock, patch
from uuid import uuid4

import pytest

from app.database import get_db
from app.models.user import User
from app.models.verification import TokenType, VerificationToken
from app.tasks.verification_cleanup import TokenCleanupService


class TestTokenCleanupService:
    """Test the TokenCleanupService class."""

    @pytest.fixture
    def mock_db(self):
        """Create a mock database session."""
        mock_session = Mock()
        mock_session.exec = Mock()
        mock_session.add = Mock()
        mock_session.commit = Mock()
        mock_session.rollback = Mock()
        mock_session.delete = Mock()
        mock_session.refresh = Mock()
        return mock_session

    @pytest.fixture
    def cleanup_service(self, mock_db):
        """Create a TokenCleanupService instance with mock database."""
        return TokenCleanupService(mock_db)

    @pytest.fixture
    def sample_tokens(self):
        """Create sample verification tokens for testing."""
        user_id = uuid4()
        now = datetime.utcnow()

        return [
            VerificationToken(
                id=uuid4(),
                user_id=user_id,
                token_type=TokenType.EMAIL_VERIFICATION,
                token_hash="hash1",
                expires_at=now - timedelta(hours=1),  # Expired
                created_at=now - timedelta(hours=25),
            ),
            VerificationToken(
                id=uuid4(),
                user_id=user_id,
                token_type=TokenType.PASSWORD_RESET,
                token_hash="hash2",
                expires_at=now - timedelta(hours=2),  # Expired
                created_at=now - timedelta(hours=26),
            ),
            VerificationToken(
                id=uuid4(),
                user_id=user_id,
                token_type=TokenType.EMAIL_VERIFICATION,
                token_hash="hash3",
                expires_at=now + timedelta(hours=1),  # Not expired
                created_at=now,
            ),
        ]

    def test_cleanup_service_initialization(self, cleanup_service):
        """Test TokenCleanupService initialization."""
        assert cleanup_service.db is not None
        assert cleanup_service.verification_service is not None

    @pytest.mark.asyncio
    async def test_cleanup_expired_tokens_no_expired(self, cleanup_service, mock_db):
        """Test cleanup when no expired tokens exist."""
        # Mock database query to return no expired tokens
        mock_db.exec.return_value.first.return_value = 0

        result = await cleanup_service.cleanup_expired_tokens()

        assert result["total_expired"] == 0
        assert result["total_cleaned"] == 0
        assert result["message"] == "No expired tokens found"
        assert "completed_at" in result

    @pytest.mark.asyncio
    async def test_cleanup_expired_tokens_with_expired(
        self, cleanup_service, mock_db, sample_tokens
    ):
        """Test cleanup with expired tokens."""
        expired_tokens = [
            token for token in sample_tokens if token.expires_at < datetime.utcnow()
        ]

        # Mock database queries
        mock_db.exec.return_value.first.return_value = len(expired_tokens)
        mock_db.exec.return_value.all.return_value = expired_tokens

        result = await cleanup_service.cleanup_expired_tokens()

        assert result["total_expired"] == len(expired_tokens)
        assert result["total_cleaned"] == len(expired_tokens)
        assert result["batches_processed"] == 1
        assert "completed_at" in result
        assert result["total_duration_seconds"] > 0

    @pytest.mark.asyncio
    async def test_cleanup_expired_tokens_with_specific_types(
        self, cleanup_service, mock_db, sample_tokens
    ):
        """Test cleanup with specific token types."""
        email_tokens = [
            token
            for token in sample_tokens
            if token.token_type == TokenType.EMAIL_VERIFICATION
        ]
        expired_email_tokens = [
            token for token in email_tokens if token.expires_at < datetime.utcnow()
        ]

        # Mock database queries
        mock_db.exec.return_value.first.return_value = len(expired_email_tokens)
        mock_db.exec.return_value.all.return_value = expired_email_tokens

        result = await cleanup_service.cleanup_expired_tokens(
            token_types=[TokenType.EMAIL_VERIFICATION]
        )

        assert result["total_expired"] == len(expired_email_tokens)
        assert result["token_types"] == [TokenType.EMAIL_VERIFICATION]

    @pytest.mark.asyncio
    async def test_cleanup_expired_tokens_dry_run(
        self, cleanup_service, mock_db, sample_tokens
    ):
        """Test cleanup dry run mode."""
        expired_tokens = [
            token for token in sample_tokens if token.expires_at < datetime.utcnow()
        ]

        # Mock database queries
        mock_db.exec.return_value.first.return_value = len(expired_tokens)
        mock_db.exec.return_value.all.return_value = expired_tokens

        result = await cleanup_service.cleanup_expired_tokens(dry_run=True)

        assert result["total_expired"] == len(expired_tokens)
        assert result["total_cleaned"] == len(expired_tokens)
        assert result["dry_run"] is True
        # Should not call delete or commit in dry run mode
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()

    @pytest.mark.asyncio
    async def test_cleanup_expired_tokens_with_errors(
        self, cleanup_service, mock_db, sample_tokens
    ):
        """Test cleanup with database errors."""
        expired_tokens = [
            token for token in sample_tokens if token.expires_at < datetime.utcnow()
        ]

        # Mock database queries
        mock_db.exec.return_value.first.return_value = len(expired_tokens)
        mock_db.exec.return_value.all.return_value = expired_tokens

        # Mock commit to raise an exception
        mock_db.commit.side_effect = Exception("Database error")

        result = await cleanup_service.cleanup_expired_tokens()

        assert result["total_expired"] == len(expired_tokens)
        assert result["total_cleaned"] == 0
        assert len(result["errors"]) > 0
        assert "Database error" in str(result["errors"])

    @pytest.mark.asyncio
    async def test_get_cleanup_statistics(self, cleanup_service, mock_db):
        """Test getting cleanup statistics."""
        # Mock database queries
        mock_db.exec.return_value.first.side_effect = [
            100,
            25,
            50,
            {"email_verification": 60, "password_reset": 40},
            10,
        ]

        result = await cleanup_service.get_cleanup_statistics(days=30)

        assert result["total_tokens"] == 100
        assert result["expired_tokens"] == 25
        assert result["used_tokens"] == 50
        assert result["active_tokens"] == 25  # 100 - 25 - 50
        assert result["expiring_soon_24h"] == 10
        assert "cleanup_recommendation" in result

    @pytest.mark.asyncio
    async def test_generate_cleanup_report(self, cleanup_service):
        """Test generating cleanup reports."""
        # Mock get_cleanup_statistics
        cleanup_service.get_cleanup_statistics = AsyncMock()
        cleanup_service.get_cleanup_statistics.return_value = {
            "total_tokens": 100,
            "expired_tokens": 25,
            "cleanup_recommendation": {"should_cleanup": True, "priority": "medium"},
        }

        result = await cleanup_service.generate_cleanup_report("weekly")

        assert result["report_type"] == "weekly"
        assert "periods" in result
        assert "recommendations" in result
        assert len(result["recommendations"]) > 0

    @pytest.mark.asyncio
    async def test_generate_cleanup_report_with_high_volume(self, cleanup_service):
        """Test report generation with high token volume."""
        # Mock get_cleanup_statistics with high volume
        cleanup_service.get_cleanup_statistics = AsyncMock()
        cleanup_service.get_cleanup_statistics.return_value = {
            "total_tokens": 10000,
            "expired_tokens": 5000,
            "cleanup_recommendation": {"should_cleanup": True, "priority": "high"},
        }

        result = await cleanup_service.generate_cleanup_report("weekly")

        # Should have performance recommendations for high volume
        performance_recs = [
            r for r in result["recommendations"] if r["type"] == "performance"
        ]
        assert len(performance_recs) > 0


class TestCleanupTasks:
    """Test Celery cleanup tasks."""

    @pytest.fixture
    def mock_celery_task(self):
        """Mock Celery task decorator."""
        with patch("app.tasks.verification_cleanup.current_task") as mock_task:
            mock_task.request.id = "test-task-id"
            yield mock_task

    @pytest.fixture
    def mock_db_session(self):
        """Mock database session generator."""
        mock_session = Mock()
        mock_session.exec = Mock()
        mock_session.add = Mock()
        mock_session.commit = Mock()
        mock_session.rollback = Mock()
        mock_session.delete = Mock()
        mock_session.close = Mock()

        def mock_get_db():
            yield mock_session

        return mock_get_db, mock_session

    @patch("app.tasks.verification_cleanup.get_db")
    @patch("app.tasks.verification_cleanup.send_cleanup_notification")
    def test_cleanup_expired_tokens_scheduled(
        self, mock_send_notification, mock_get_db, mock_celery_task, mock_db_session
    ):
        """Test scheduled cleanup task."""
        get_db_func, mock_session = mock_db_session
        mock_get_db.return_value = get_db_func()

        # Mock cleanup service
        mock_cleanup_service = Mock()
        mock_cleanup_service.cleanup_expired_tokens.return_value = {
            "total_cleaned": 150,
            "total_expired": 150,
            "batches_processed": 1,
        }

        with patch(
            "app.tasks.verification_cleanup.TokenCleanupService",
            return_value=mock_cleanup_service,
        ):
            from app.tasks.verification_cleanup import \
                cleanup_expired_tokens_scheduled

            result = cleanup_expired_tokens_scheduled()

            assert result["total_cleaned"] == 150
            # Should send notification for significant cleanup (>100)
            mock_send_notification.delay.assert_called_once()

    @patch("app.tasks.verification_cleanup.get_db")
    @patch("app.tasks.verification_cleanup.send_cleanup_notification")
    def test_cleanup_expired_tokens_daily(
        self, mock_send_notification, mock_get_db, mock_celery_task, mock_db_session
    ):
        """Test daily cleanup task."""
        get_db_func, mock_session = mock_db_session
        mock_get_db.return_value = get_db_func()

        # Mock cleanup service
        mock_cleanup_service = Mock()
        mock_cleanup_service.cleanup_expired_tokens.return_value = {
            "total_cleaned": 500,
            "total_expired": 500,
            "batches_processed": 2,
        }

        with patch(
            "app.tasks.verification_cleanup.TokenCleanupService",
            return_value=mock_cleanup_service,
        ):
            from app.tasks.verification_cleanup import \
                cleanup_expired_tokens_daily

            result = cleanup_expired_tokens_daily()

            assert result["total_cleaned"] == 500
            # Should always send notification for daily cleanup
            mock_send_notification.delay.assert_called_once()

    @patch("app.tasks.verification_cleanup.get_db")
    @patch("app.tasks.verification_cleanup.send_cleanup_notification")
    def test_generate_cleanup_report(
        self, mock_send_notification, mock_get_db, mock_celery_task, mock_db_session
    ):
        """Test cleanup report generation task."""
        get_db_func, mock_session = mock_db_session
        mock_get_db.return_value = get_db_func()

        # Mock cleanup service
        mock_cleanup_service = Mock()
        mock_cleanup_service.generate_cleanup_report.return_value = {
            "report_type": "weekly",
            "periods": {"7_days": {"total_tokens": 100}},
            "recommendations": [],
        }

        with patch(
            "app.tasks.verification_cleanup.TokenCleanupService",
            return_value=mock_cleanup_service,
        ):
            from app.tasks.verification_cleanup import generate_cleanup_report

            result = generate_cleanup_report()

            assert result["report_type"] == "weekly"
            mock_send_notification.delay.assert_called_once()

    @patch("app.tasks.verification_cleanup.get_db")
    @patch("app.tasks.verification_cleanup.send_cleanup_notification")
    def test_manual_cleanup_expired_tokens(
        self, mock_send_notification, mock_get_db, mock_celery_task, mock_db_session
    ):
        """Test manual cleanup task."""
        get_db_func, mock_session = mock_db_session
        mock_get_db.return_value = get_db_func()

        # Mock cleanup service
        mock_cleanup_service = Mock()
        mock_cleanup_service.cleanup_expired_tokens.return_value = {
            "total_cleaned": 200,
            "total_expired": 200,
            "batches_processed": 1,
        }

        with patch(
            "app.tasks.verification_cleanup.TokenCleanupService",
            return_value=mock_cleanup_service,
        ):
            from app.tasks.verification_cleanup import \
                manual_cleanup_expired_tokens

            result = manual_cleanup_expired_tokens(
                token_types=["email_verification"],
                batch_size=1000,
                dry_run=False,
                user_id="test-user-id",
            )

            assert result["total_cleaned"] == 200
            assert "manual_cleanup" in result
            assert result["manual_cleanup"]["initiated_by"] == "test-user-id"
            mock_send_notification.delay.assert_called_once()


class TestCleanupEndpoints:
    """Test admin cleanup endpoints."""

    @pytest.fixture
    def mock_current_user(self):
        """Create a mock admin user."""
        user = Mock()
        user.id = uuid4()
        user.role = "admin"
        user.email = "admin@example.com"
        return user

    @pytest.fixture
    def mock_db_session(self):
        """Mock database session."""
        mock_session = Mock()
        mock_session.exec = Mock()
        mock_session.add = Mock()
        mock_session.commit = Mock()
        mock_session.rollback = Mock()
        mock_session.delete = Mock()
        return mock_session

    def test_get_cleanup_statistics_admin_only(self, client, mock_current_user):
        """Test that cleanup statistics endpoint requires admin access."""
        # Test with non-admin user
        non_admin_user = Mock()
        non_admin_user.role = "writer"

        with patch("app.routes.admin.get_current_user", return_value=non_admin_user):
            response = client.get("/api/admin/cleanup/statistics")
            assert response.status_code == 403

    def test_cleanup_expired_tokens_manual_admin_only(self, client, mock_current_user):
        """Test that manual cleanup endpoint requires admin access."""
        # Test with non-admin user
        non_admin_user = Mock()
        non_admin_user.role = "writer"

        with patch("app.routes.admin.get_current_user", return_value=non_admin_user):
            response = client.post("/api/admin/cleanup/expired-tokens")
            assert response.status_code == 403

    def test_cleanup_health_check_admin_only(self, client, mock_current_user):
        """Test that cleanup health check endpoint requires admin access."""
        # Test with non-admin user
        non_admin_user = Mock()
        non_admin_user.role = "writer"

        with patch("app.routes.admin.get_current_user", return_value=non_admin_user):
            response = client.post("/api/admin/cleanup/health-check")
            assert response.status_code == 403


if __name__ == "__main__":
    pytest.main([__file__])
