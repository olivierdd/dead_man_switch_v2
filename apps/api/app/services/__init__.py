"""
Services package for the Secret Safe API.

This package contains business logic services including:
- Email service for sending verification emails
- Token service for managing verification tokens
- User service for user management operations
"""

from .email_service import (AWSSESProvider, EmailProvider, EmailService,
                            SendGridProvider, email_service)
from .email_templates import EmailTemplateManager, email_template_manager
from .verification_service import VerificationService

__all__ = [
    "email_service",
    "EmailService",
    "EmailProvider",
    "SendGridProvider",
    "AWSSESProvider",
    "email_template_manager",
    "EmailTemplateManager",
    "VerificationService",
]
