"""
Verification Token Models

Models for managing email verification tokens, password reset tokens,
and other verification-related functionality.
"""

import hashlib
import secrets
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
from uuid import UUID

from sqlalchemy import JSON, Column
from sqlmodel import Field, Relationship, SQLModel


class TokenType(str, Enum):
    """Types of verification tokens."""

    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"
    EMAIL_CHANGE = "email_change"
    TWO_FACTOR_AUTH = "two_factor_auth"


class VerificationToken(SQLModel, table=True):
    """Model for storing verification tokens."""

    __tablename__ = "verification_tokens"

    id: Optional[UUID] = Field(default=None, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    token_type: TokenType = Field(index=True)
    token_hash: str = Field(unique=True, index=True)
    expires_at: datetime = Field(index=True)
    used_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Additional metadata
    # For storing additional data like new email, etc.
    token_metadata: Optional[str] = Field(default=None, sa_column=Column(JSON))

    # Relationships
    # user: Optional["User"] = Relationship(back_populates="verification_tokens")
    # TODO: Re-enable when verification system is fully implemented

    class Config:
        arbitrary_types_allowed = True


class TokenManager:
    """Utility class for managing verification tokens."""

    @staticmethod
    def generate_token() -> str:
        """Generate a cryptographically secure random token."""
        return secrets.token_urlsafe(32)

    @staticmethod
    def hash_token(token: str) -> str:
        """Hash a token for secure storage."""
        return hashlib.sha256(token.encode()).hexdigest()

    @staticmethod
    def verify_token(stored_hash: str, provided_token: str) -> bool:
        """Verify a provided token against a stored hash."""
        provided_hash = hashlib.sha256(provided_token.encode()).hexdigest()
        return secrets.compare_digest(stored_hash, provided_hash)

    @staticmethod
    def calculate_expiry(hours: int = 24) -> datetime:
        """Calculate token expiry time."""
        return datetime.utcnow() + timedelta(hours=hours)

    @staticmethod
    def is_expired(expires_at: datetime) -> bool:
        """Check if a token has expired."""
        return datetime.utcnow() > expires_at

    @staticmethod
    def is_used(used_at: Optional[datetime]) -> bool:
        """Check if a token has been used."""
        return used_at is not None


class VerificationTokenCreate(SQLModel):
    """Schema for creating verification tokens."""

    user_id: UUID
    token_type: TokenType
    expires_at: datetime
    token_metadata: Optional[str] = None


class VerificationTokenResponse(SQLModel):
    """Schema for verification token responses."""

    id: UUID
    user_id: UUID
    token_type: TokenType
    expires_at: datetime
    created_at: datetime
    used_at: Optional[datetime] = None
    is_expired: bool
    is_used: bool


class TokenValidationRequest(SQLModel):
    """Schema for token validation requests."""

    token: str
    token_type: TokenType


class TokenValidationResponse(SQLModel):
    """Schema for token validation responses."""

    valid: bool
    user_id: Optional[UUID] = None
    message: str
    expires_at: Optional[datetime] = None
    token_metadata: Optional[str] = None
