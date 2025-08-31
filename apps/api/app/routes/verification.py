"""
Verification API Routes

Handles email verification, password reset, and other verification-related
API endpoints for the Secret Safe platform.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from sqlmodel import Session
from typing import Optional
from uuid import UUID
from datetime import datetime

from ..models.verification import (
    TokenValidationRequest,
    TokenValidationResponse,
    TokenType
)
from ..models.user import User
from ..services.verification_service import VerificationService
from ..models.database import get_db
from ..routes.auth import get_current_user
from ..settings import settings

router = APIRouter(prefix="/verification", tags=["verification"])


@router.post("/send-verification", response_model=dict)
async def send_verification_email(
    user_id: UUID,
    base_url: Optional[str] = Query(
        None, description="Base URL for verification links"),
    db: Session = Depends(get_db)
):
    """Send verification email to a user."""
    try:
        # Get settings for default base URL
        if not base_url:
            base_url = settings.BASE_URL or "http://localhost:3000"

        # Create verification service
        verification_service = VerificationService(db)

        # Get user
        from ..models.user import User
        from sqlmodel import select

        stmt = select(User).where(User.id == user_id)
        user = db.exec(stmt).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if user.is_verified:
            return {
                "success": True,
                "message": "User is already verified",
                "user_id": str(user_id)
            }

        # Create verification token
        token = await verification_service.create_verification_token(
            user_id=user_id,
            token_type=TokenType.EMAIL_VERIFICATION,
            expiry_hours=24
        )

        if not token:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create verification token"
            )

        # Send verification email
        email_sent = await verification_service.send_verification_email(
            user=user,
            token=token,
            base_url=base_url,
            expiry_hours=24
        )

        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email"
            )

        return {
            "success": True,
            "message": "Verification email sent successfully",
            "user_id": str(user_id),
            "expires_in_hours": 24
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/verify-email", response_model=dict)
async def verify_email(
    token: str = Query(..., description="Verification token"),
    db: Session = Depends(get_db)
):
    """Verify user email with token."""
    try:
        verification_service = VerificationService(db)

        # Validate token
        validation_result = await verification_service.validate_token(
            token=token,
            token_type=TokenType.EMAIL_VERIFICATION
        )

        if not validation_result.valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=validation_result.message
            )

        # Mark token as used
        token_marked = await verification_service.mark_token_used(
            token=token,
            token_type=TokenType.EMAIL_VERIFICATION
        )

        if not token_marked:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process verification token"
            )

        # Verify user email
        email_verified = await verification_service.verify_user_email(
            user_id=validation_result.user_id
        )

        if not email_verified:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to verify user email"
            )

        # Get user for welcome email
        from ..models.user import User
        from sqlmodel import select

        stmt = select(User).where(User.id == validation_result.user_id)
        user = db.exec(stmt).first()

        if user:
            # Send welcome email (async, don't wait for result)
            base_url = settings.BASE_URL or "http://localhost:3000"

            # Note: In production, this should be sent via background task
            try:
                await verification_service.send_welcome_email(
                    user=user,
                    base_url=base_url
                )
            except Exception as e:
                # Log error but don't fail verification
                print(f"Warning: Failed to send welcome email: {e}")

        return {
            "success": True,
            "message": "Email verified successfully",
            "user_id": str(validation_result.user_id),
            "verified_at": "now"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/send-password-reset", response_model=dict)
async def send_password_reset_email(
    email: str = Query(..., description="User email address"),
    base_url: Optional[str] = Query(
        None, description="Base URL for reset links"),
    db: Session = Depends(get_db)
):
    """Send password reset email to user."""
    try:
        # Get settings for default base URL
        if not base_url:
            base_url = settings.BASE_URL or "http://localhost:3000"

        # Create verification service
        verification_service = VerificationService(db)

        # Get user by email
        from ..models.user import User
        from sqlmodel import select

        stmt = select(User).where(User.email == email)
        user = db.exec(stmt).first()

        if not user:
            # Don't reveal if user exists or not for security
            return {
                "success": True,
                "message": "If an account with this email exists, a password reset link has been sent",
                "email": email
            }

        # Create password reset token
        token = await verification_service.create_verification_token(
            user_id=user.id,
            token_type=TokenType.PASSWORD_RESET,
            expiry_hours=24
        )

        if not token:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create password reset token"
            )

        # Send password reset email
        email_sent = await verification_service.send_password_reset_email(
            user=user,
            token=token,
            base_url=base_url,
            expiry_hours=24
        )

        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send password reset email"
            )

        return {
            "success": True,
            "message": "Password reset email sent successfully",
            "email": email,
            "expires_in_hours": 24
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/verify-password-reset-token", response_model=TokenValidationResponse)
async def verify_password_reset_token(
    token: str = Query(..., description="Password reset token"),
    db: Session = Depends(get_db)
):
    """Verify password reset token validity."""
    try:
        verification_service = VerificationService(db)

        # Validate token
        validation_result = await verification_service.validate_token(
            token=token,
            token_type=TokenType.PASSWORD_RESET
        )

        return validation_result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/resend-verification", response_model=dict)
async def resend_verification_email(
    user_id: UUID,
    base_url: Optional[str] = Query(
        None, description="Base URL for verification links"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resend verification email for a user (requires authentication)."""
    try:
        # Check if user is requesting their own verification or is admin
        if current_user.id != user_id and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )

        # Get settings for default base URL
        if not base_url:
            base_url = settings.BASE_URL or "http://localhost:3000"

        # Create verification service
        verification_service = VerificationService(db)

        # Resend verification email
        success = await verification_service.resend_verification_email(
            user_id=user_id,
            base_url=base_url,
            expiry_hours=24
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to resend verification email"
            )

        return {
            "success": True,
            "message": "Verification email resent successfully",
            "user_id": str(user_id),
            "expires_in_hours": 24
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/status/{user_id}", response_model=dict)
async def get_verification_status(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get verification status for a user (requires authentication)."""
    try:
        # Check if user is requesting their own status or is admin
        if current_user.id != user_id and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )

        # Create verification service
        verification_service = VerificationService(db)

        # Get verification status
        status_info = await verification_service.get_user_verification_status(user_id)

        if "error" in status_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=status_info["error"]
            )

        return status_info

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/cleanup-expired", response_model=dict)
async def cleanup_expired_tokens(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clean up expired verification tokens (admin only)."""
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Create verification service
        verification_service = VerificationService(db)

        # Clean up expired tokens
        cleaned_count = await verification_service.cleanup_expired_tokens()

        return {
            "success": True,
            "message": f"Cleaned up {cleaned_count} expired tokens",
            "cleaned_count": cleaned_count
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/test-email-service", response_model=dict)
async def test_email_service(
    email: str = Query(..., description="Test email address"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Test email service functionality (admin only)."""
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Create verification service
        verification_service = VerificationService(db)

        # Get user
        from ..models.user import User
        from sqlmodel import select

        stmt = select(User).where(User.email == email)
        user = db.exec(stmt).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Test email sending with a simple message
        from ..services.email_service import email_service

        test_html = """
        <html>
        <body>
            <h1>Email Service Test</h1>
            <p>This is a test email to verify the email service is working correctly.</p>
            <p>Sent at: {timestamp}</p>
        </body>
        </html>
        """.format(timestamp=datetime.utcnow().isoformat())

        test_text = f"""
        Email Service Test
        
        This is a test email to verify the email service is working correctly.
        
        Sent at: {datetime.utcnow().isoformat()}
        """

        # Send test email
        success = await email_service.send_email(
            to_email=email,
            subject="Email Service Test - Secret Safe",
            html_content=test_html,
            text_content=test_text
        )

        if success:
            return {
                "success": True,
                "message": "Test email sent successfully",
                "email": email,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send test email"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
