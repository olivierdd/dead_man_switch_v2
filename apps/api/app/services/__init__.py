"""
Services package for the Secret Safe API.

This package contains business logic services including:
- Email service for sending verification emails
- Token service for managing verification tokens
- User service for user management operations
"""

from .email_service import email_service, EmailService, EmailProvider, SendGridProvider, AWSSESProvider
from .email_templates import email_template_manager, EmailTemplateManager
from .verification_service import VerificationService

__all__ = [
    "email_service",
    "EmailService",
    "EmailProvider",
    "SendGridProvider",
    "AWSSESProvider",
    "email_template_manager",
    "EmailTemplateManager",
    "VerificationService"
]
