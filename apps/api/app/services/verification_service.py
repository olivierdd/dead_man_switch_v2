"""
Verification Service

Handles email verification, password reset, and other verification-related
business logic for the Secret Safe platform.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import UUID
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError

from ..models.verification import (
    VerificationToken,
    TokenType,
    TokenManager,
    VerificationTokenCreate,
    TokenValidationRequest,
    TokenValidationResponse
)
from ..models.user import User
from .email_service import email_service
from .email_templates import email_template_manager

logger = logging.getLogger(__name__)


class VerificationService:
    """Service for handling verification operations."""

    def __init__(self, db: Session):
        self.db = db
        self.token_manager = TokenManager()

    async def create_verification_token(
        self,
        user_id: UUID,
        token_type: TokenType,
        expiry_hours: int = 24,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        """Create a new verification token for a user."""
        try:
            # Generate secure token
            token = self.token_manager.generate_token()
            token_hash = self.token_manager.hash_token(token)

            # Calculate expiry
            expires_at = self.token_manager.calculate_expiry(expiry_hours)

            # Create token record
            verification_token = VerificationToken(
                user_id=user_id,
                token_type=token_type,
                token_hash=token_hash,
                expires_at=expires_at,
                metadata=metadata
            )

            # Save to database
            self.db.add(verification_token)
            self.db.commit()
            self.db.refresh(verification_token)

            logger.info(f"Created {token_type} token for user {user_id}")
            return token

        except IntegrityError as e:
            logger.error(f"Database error creating verification token: {e}")
            self.db.rollback()
            return None
        except Exception as e:
            logger.error(f"Error creating verification token: {e}")
            self.db.rollback()
            return None

    async def validate_token(
        self,
        token: str,
        token_type: TokenType
    ) -> TokenValidationResponse:
        """Validate a verification token."""
        try:
            # Hash the provided token
            token_hash = self.token_manager.hash_token(token)

            # Find token in database
            stmt = select(VerificationToken).where(
                VerificationToken.token_hash == token_hash,
                VerificationToken.token_type == token_type
            )
            verification_token = self.db.exec(stmt).first()

            if not verification_token:
                return TokenValidationResponse(
                    valid=False,
                    message="Invalid verification token"
                )

            # Check if token is expired
            if self.token_manager.is_expired(verification_token.expires_at):
                return TokenValidationResponse(
                    valid=False,
                    message="Verification token has expired"
                )

            # Check if token has been used
            if self.token_manager.is_used(verification_token.used_at):
                return TokenValidationResponse(
                    valid=False,
                    message="Verification token has already been used"
                )

            return TokenValidationResponse(
                valid=True,
                user_id=verification_token.user_id,
                message="Token is valid",
                expires_at=verification_token.expires_at,
                metadata=verification_token.token_metadata
            )

        except Exception as e:
            logger.error(f"Error validating token: {e}")
            return TokenValidationResponse(
                valid=False,
                message="Error validating token"
            )

    async def mark_token_used(self, token: str, token_type: TokenType) -> bool:
        """Mark a verification token as used."""
        try:
            token_hash = self.token_manager.hash_token(token)

            stmt = select(VerificationToken).where(
                VerificationToken.token_hash == token_hash,
                VerificationToken.token_type == token_type
            )
            verification_token = self.db.exec(stmt).first()

            if verification_token:
                verification_token.used_at = datetime.utcnow()
                self.db.commit()
                logger.info(
                    f"Marked {token_type} token as used for user {verification_token.user_id}")
                return True

            return False

        except Exception as e:
            logger.error(f"Error marking token as used: {e}")
            self.db.rollback()
            return False

    async def send_verification_email(
        self,
        user: User,
        token: str,
        base_url: str,
        expiry_hours: int = 24
    ) -> bool:
        """Send email verification email to user."""
        try:
            # Build verification URL
            verification_url = f"{base_url}/auth/verify-email?token={token}"

            # Prepare template context
            context = {
                "user": user,
                "verification_url": verification_url,
                "base_url": base_url,
                "expiry_hours": expiry_hours
            }

            # Render email content
            html_content = email_template_manager.render_template(
                "email_verification", "html", context
            )
            text_content = email_template_manager.render_template(
                "email_verification", "text", context
            )

            # Send email
            success = await email_service.send_email(
                to_email=user.email,
                subject="Verify Your Email - Secret Safe",
                html_content=html_content,
                text_content=text_content
            )

            if success:
                logger.info(f"Verification email sent to {user.email}")
            else:
                logger.error(
                    f"Failed to send verification email to {user.email}")

            return success

        except Exception as e:
            logger.error(f"Error sending verification email: {e}")
            return False

    async def send_password_reset_email(
        self,
        user: User,
        token: str,
        base_url: str,
        expiry_hours: int = 24
    ) -> bool:
        """Send password reset email to user."""
        try:
            # Build reset URL
            reset_url = f"{base_url}/auth/reset-password?token={token}"

            # Prepare template context
            context = {
                "user": user,
                "reset_url": reset_url,
                "base_url": base_url,
                "expiry_hours": expiry_hours
            }

            # Render email content
            html_content = email_template_manager.render_template(
                "password_reset", "html", context
            )
            text_content = email_template_manager.render_template(
                "password_reset", "text", context
            )

            # Send email
            success = await email_service.send_email(
                to_email=user.email,
                subject="Reset Your Password - Secret Safe",
                html_content=html_content,
                text_content=text_content
            )

            if success:
                logger.info(f"Password reset email sent to {user.email}")
            else:
                logger.error(
                    f"Failed to send password reset email to {user.email}")

            return success

        except Exception as e:
            logger.error(f"Error sending password reset email: {e}")
            return False

    async def send_welcome_email(
        self,
        user: User,
        base_url: str
    ) -> bool:
        """Send welcome email after successful verification."""
        try:
            # Build dashboard URL
            dashboard_url = f"{base_url}/dashboard"

            # Prepare template context
            context = {
                "user": user,
                "dashboard_url": dashboard_url,
                "base_url": base_url
            }

            # Render email content
            html_content = email_template_manager.render_template(
                "welcome", "html", context
            )
            text_content = email_template_manager.render_template(
                "welcome", "text", context
            )

            # Send email
            success = await email_service.send_email(
                to_email=user.email,
                subject="Welcome to Secret Safe! 🎉",
                html_content=html_content,
                text_content=text_content
            )

            if success:
                logger.info(f"Welcome email sent to {user.email}")
            else:
                logger.error(f"Failed to send welcome email to {user.email}")

            return success

        except Exception as e:
            logger.error(f"Error sending welcome email: {e}")
            return False

    async def verify_user_email(self, user_id: UUID) -> bool:
        """Mark user's email as verified."""
        try:
            # Get user
            stmt = select(User).where(User.id == user_id)
            user = self.db.exec(stmt).first()

            if not user:
                logger.error(
                    f"User {user_id} not found for email verification")
                return False

            # Update user verification status
            user.is_verified = True
            user.email_verified_at = datetime.utcnow()
            user.updated_at = datetime.utcnow()

            self.db.commit()

            logger.info(f"User {user_id} email verified successfully")
            return True

        except Exception as e:
            logger.error(f"Error verifying user email: {e}")
            self.db.rollback()
            return False

    async def cleanup_expired_tokens(self) -> int:
        """Clean up expired verification tokens."""
        try:
            # Find expired tokens
            stmt = select(VerificationToken).where(
                VerificationToken.expires_at < datetime.utcnow()
            )
            expired_tokens = self.db.exec(stmt).all()

            # Delete expired tokens
            count = len(expired_tokens)
            for token in expired_tokens:
                self.db.delete(token)

            self.db.commit()

            if count > 0:
                logger.info(f"Cleaned up {count} expired verification tokens")

            return count

        except Exception as e:
            logger.error(f"Error cleaning up expired tokens: {e}")
            self.db.rollback()
            return 0

    async def get_user_verification_status(self, user_id: UUID) -> Dict[str, Any]:
        """Get user's verification status and pending tokens."""
        try:
            # Get user
            stmt = select(User).where(User.id == user_id)
            user = self.db.exec(stmt).first()

            if not user:
                return {"error": "User not found"}

            # Get pending verification tokens
            stmt = select(VerificationToken).where(
                VerificationToken.user_id == user_id,
                VerificationToken.used_at.is_(None),
                VerificationToken.expires_at > datetime.utcnow()
            )
            pending_tokens = self.db.exec(stmt).all()

            return {
                "user_id": user_id,
                "email": user.email,
                "is_verified": user.is_verified,
                "email_verified_at": user.email_verified_at,
                "pending_tokens": [
                    {
                        "type": token.token_type,
                        "expires_at": token.expires_at,
                        "created_at": token.created_at
                    }
                    for token in pending_tokens
                ]
            }

        except Exception as e:
            logger.error(f"Error getting user verification status: {e}")
            return {"error": "Error retrieving verification status"}

    async def resend_verification_email(
        self,
        user_id: UUID,
        base_url: str,
        expiry_hours: int = 24
    ) -> bool:
        """Resend verification email for a user."""
        try:
            # Get user
            stmt = select(User).where(User.id == user_id)
            user = self.db.exec(stmt).first()

            if not user:
                logger.error(
                    f"User {user_id} not found for resending verification")
                return False

            if user.is_verified:
                logger.info(f"User {user_id} is already verified")
                return False

            # Create new verification token
            token = await self.create_verification_token(
                user_id=user_id,
                token_type=TokenType.EMAIL_VERIFICATION,
                expiry_hours=expiry_hours
            )

            if not token:
                return False

            # Send verification email
            return await self.send_verification_email(
                user=user,
                token=token,
                base_url=base_url,
                expiry_hours=expiry_hours
            )

        except Exception as e:
            logger.error(f"Error resending verification email: {e}")
            return False
