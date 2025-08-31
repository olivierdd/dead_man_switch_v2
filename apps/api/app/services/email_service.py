"""
Email Service Abstraction Layer

Provides a unified interface for sending emails through multiple providers
with fallback mechanisms and comprehensive error handling.
"""

import logging
import os
from abc import ABC, abstractmethod
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, List, Optional, Union

# Configure logging
logger = logging.getLogger(__name__)


class EmailProvider(ABC):
    """Abstract base class for email providers."""

    @abstractmethod
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        from_email: Optional[str] = None,
        reply_to: Optional[str] = None,
        attachments: Optional[List[Dict]] = None,
    ) -> bool:
        """Send an email through this provider."""
        pass

    @abstractmethod
    async def test_connection(self) -> bool:
        """Test the connection to this email provider."""
        pass


class SendGridProvider(EmailProvider):
    """SendGrid email provider implementation."""

    def __init__(self, api_key: str, from_email: str = None):
        self.api_key = api_key
        self.from_email = from_email or os.getenv(
            "FROM_EMAIL", "noreply@yoursecretissafe.com"
        )
        self._client = None

    async def _get_client(self):
        """Lazy load SendGrid client."""
        if self._client is None:
            try:
                from sendgrid import SendGridAPIClient

                self._client = SendGridAPIClient(api_key=self.api_key)
            except ImportError:
                logger.error(
                    "SendGrid package not installed. Install with: pip install sendgrid"
                )
                raise ImportError("SendGrid package not installed")
        return self._client

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        from_email: Optional[str] = None,
        reply_to: Optional[str] = None,
        attachments: Optional[List[Dict]] = None,
    ) -> bool:
        """Send email via SendGrid."""
        try:
            from sendgrid.helpers.mail import (
                Attachment,
                Content,
                Disposition,
                Email,
                FileContent,
                FileName,
                FileType,
                Mail,
                To,
            )

            client = await self._get_client()

            # Create email message
            from_email_obj = Email(from_email or self.from_email)
            to_email_obj = To(to_email)

            # Create content
            html_content_obj = Content("text/html", html_content)
            content_objects = [html_content_obj]

            if text_content:
                text_content_obj = Content("text/plain", text_content)
                content_objects.append(text_content_obj)

            # Create mail object
            mail = Mail(from_email_obj, to_email_obj, subject, content_objects[0])

            # Add text content if provided
            if len(content_objects) > 1:
                mail.add_content(content_objects[1])

            # Add reply-to if specified
            if reply_to:
                mail.reply_to = Email(reply_to)

            # Add attachments if provided
            if attachments:
                for attachment in attachments:
                    file_content = FileContent(attachment.get("content", ""))
                    file_name = FileName(attachment.get("filename", "attachment"))
                    file_type = FileType(
                        attachment.get("type", "application/octet-stream")
                    )
                    disposition = Disposition(
                        attachment.get("disposition", "attachment")
                    )

                    attachment_obj = Attachment(
                        file_content, file_name, file_type, disposition
                    )
                    mail.add_attachment(attachment_obj)

            # Send email
            response = client.send(mail)

            if response.status_code in [200, 201, 202]:
                logger.info(f"Email sent successfully via SendGrid to {to_email}")
                return True
            else:
                logger.error(
                    f"SendGrid error: {response.status_code} - {response.body}"
                )
                return False

        except Exception as e:
            logger.error(f"SendGrid email sending failed: {str(e)}")
            return False

    async def test_connection(self) -> bool:
        """Test SendGrid connection by sending a test email."""
        try:
            # Try to get client (this will test API key validity)
            client = await self._get_client()

            # Test with a simple API call
            from sendgrid.helpers.mail import Content, Email, Mail, To

            test_mail = Mail(
                from_email=Email(self.from_email),
                to_emails=To("test@example.com"),
                subject="Connection Test",
                html_content=Content("text/html", "<p>This is a connection test.</p>"),
            )

            # Don't actually send, just validate the mail object
            # This tests that the client can create valid mail objects
            return True

        except Exception as e:
            logger.error(f"SendGrid connection test failed: {str(e)}")
            return False


class AWSSESProvider(EmailProvider):
    """AWS SES email provider implementation."""

    def __init__(
        self,
        region: str,
        access_key_id: str,
        secret_access_key: str,
        from_email: str = None,
    ):
        self.region = region
        self.access_key_id = access_key_id
        self.secret_access_key = secret_access_key
        self.from_email = from_email or os.getenv(
            "FROM_EMAIL", "noreply@yoursecretissafe.com"
        )
        self._client = None

    async def _get_client(self):
        """Lazy load AWS SES client."""
        if self._client is None:
            try:
                import boto3

                self._client = boto3.client(
                    "ses",
                    region_name=self.region,
                    aws_access_key_id=self.access_key_id,
                    aws_secret_access_key=self.secret_access_key,
                )
            except ImportError:
                logger.error(
                    "boto3 package not installed. Install with: pip install boto3"
                )
                raise ImportError("boto3 package not installed")
        return self._client

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        from_email: Optional[str] = None,
        reply_to: Optional[str] = None,
        attachments: Optional[List[Dict]] = None,
    ) -> bool:
        """Send email via AWS SES."""
        try:
            import boto3
            from botocore.exceptions import ClientError

            client = await self._get_client()

            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = from_email or self.from_email
            message["To"] = to_email

            if reply_to:
                message["Reply-To"] = reply_to

            # Add text content
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)

            # Add HTML content
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            # Convert to string
            message_body = message.as_string()

            # Send email
            response = client.send_raw_email(
                Source=from_email or self.from_email,
                Destinations=[to_email],
                RawMessage={"Data": message_body},
            )

            logger.info(
                f"Email sent successfully via AWS SES to {to_email}, MessageId: {response['MessageId']}"
            )
            return True

        except ClientError as e:
            logger.error(
                f"AWS SES error: {e.response['Error']['Code']} - {e.response['Error']['Message']}"
            )
            return False
        except Exception as e:
            logger.error(f"AWS SES email sending failed: {str(e)}")
            return False

    async def test_connection(self) -> bool:
        """Test AWS SES connection."""
        try:
            client = await self._get_client()

            # Test with a simple API call to get send quota
            response = client.get_send_quota()

            if response["ResponseMetadata"]["HTTPStatusCode"] == 200:
                logger.info(
                    f"AWS SES connection test successful. Quota: {response['Max24HourSend']} emails/day"
                )
                return True
            else:
                return False

        except Exception as e:
            logger.error(f"AWS SES connection test failed: {str(e)}")
            return False


class EmailService:
    """Main email service that manages multiple providers with fallback."""

    def __init__(self):
        self.providers: List[EmailProvider] = []
        self.current_provider_index = 0
        self._setup_providers()

    def _setup_providers(self):
        """Setup available email providers based on environment variables."""
        try:
            # Try SendGrid first
            sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
            if sendgrid_api_key:
                sendgrid_provider = SendGridProvider(sendgrid_api_key)
                self.providers.append(sendgrid_provider)
                logger.info("SendGrid provider configured")

            # Try AWS SES
            aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
            aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
            aws_region = os.getenv("AWS_REGION", "us-east-1")

            if aws_access_key and aws_secret_key:
                ses_provider = AWSSESProvider(
                    aws_region, aws_access_key, aws_secret_key
                )
                self.providers.append(ses_provider)
                logger.info("AWS SES provider configured")

            if not self.providers:
                logger.warning(
                    "No email providers configured. Email functionality will not work."
                )

        except Exception as e:
            logger.error(f"Error setting up email providers: {str(e)}")

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        from_email: Optional[str] = None,
        reply_to: Optional[str] = None,
        attachments: Optional[List[Dict]] = None,
    ) -> bool:
        """Send email using available providers with fallback."""
        if not self.providers:
            logger.error("No email providers available")
            return False

        # Try current provider first
        for attempt in range(len(self.providers)):
            provider_index = (self.current_provider_index + attempt) % len(
                self.providers
            )
            provider = self.providers[provider_index]

            try:
                success = await provider.send_email(
                    to_email=to_email,
                    subject=subject,
                    html_content=html_content,
                    text_content=text_content,
                    from_email=from_email,
                    reply_to=reply_to,
                    attachments=attachments,
                )

                if success:
                    # Update current provider to the successful one
                    self.current_provider_index = provider_index
                    return True
                else:
                    logger.warning(
                        f"Provider {provider.__class__.__name__} failed, trying next..."
                    )

            except Exception as e:
                logger.error(f"Provider {provider.__class__.__name__} error: {str(e)}")
                continue

        logger.error("All email providers failed")
        return False

    async def test_all_providers(self) -> Dict[str, bool]:
        """Test all configured email providers."""
        results = {}

        for i, provider in enumerate(self.providers):
            provider_name = f"{provider.__class__.__name__}_{i}"
            try:
                results[provider_name] = await provider.test_connection()
            except Exception as e:
                logger.error(f"Error testing {provider_name}: {str(e)}")
                results[provider_name] = False

        return results

    def get_provider_status(self) -> Dict[str, str]:
        """Get status of all email providers."""
        status = {}

        for i, provider in enumerate(self.providers):
            provider_name = f"{provider.__class__.__name__}_{i}"
            status[provider_name] = "Configured"

            # Check if this is the current active provider
            if i == self.current_provider_index:
                status[provider_name] += " (Active)"

        return status

    # Notification Email Methods

    async def send_verification_success_email(
        self,
        to_email: str,
        to_name: str,
        verification_type: str = "email",
        additional_data: Optional[Dict] = None,
    ) -> bool:
        """Send verification success email notification."""
        try:
            subject = "🎉 Verification Successful - Welcome to Secret Safe!"

            # Create HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verification Successful</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .success-icon {{ font-size: 48px; margin-bottom: 20px; }}
                    .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Verification Successful!</h1>
                        <p>Welcome to Secret Safe</p>
                    </div>
                    <div class="content">
                        <div class="success-icon">✅</div>
                        <h2>Hello {to_name},</h2>
                        <p>Great news! Your <strong>{verification_type}</strong> has been successfully verified.</p>
                        <p>You now have full access to all Secret Safe features:</p>
                        <ul>
                            <li>🔐 Secure message storage</li>
                            <li>📱 Cross-platform access</li>
                            <li>🛡️ Advanced security features</li>
                            <li>📊 Message analytics</li>
                        </ul>
                        <p><a href="{os.getenv('FRONTEND_URL', 'https://app.yoursecretissafe.com')}/dashboard" class="button">Access Your Dashboard</a></p>
                        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                        <p>Welcome aboard!</p>
                        <p><strong>The Secret Safe Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This email was sent to {to_email}</p>
                        <p>© 2025 Secret Safe. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """

            # Create plain text content
            text_content = f"""
            Verification Successful - Welcome to Secret Safe!
            
            Hello {to_name},
            
            Great news! Your {verification_type} has been successfully verified.
            
            You now have full access to all Secret Safe features:
            - Secure message storage
            - Cross-platform access
            - Advanced security features
            - Message analytics
            
            Access your dashboard: {os.getenv('FRONTEND_URL', 'https://app.yoursecretissafe.com')}/dashboard
            
            If you have any questions or need assistance, please don't hesitate to contact our support team.
            
            Welcome aboard!
            The Secret Safe Team
            
            This email was sent to {to_email}
            © 2025 Secret Safe. All rights reserved.
            """

            return await self.send_email(
                to_email=to_email,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
            )

        except Exception as e:
            logger.error(f"Error sending verification success email: {e}")
            return False

    async def send_verification_failure_email(
        self,
        to_email: str,
        to_name: str,
        failure_reason: str,
        verification_type: str = "email",
        retry_available: bool = True,
        additional_data: Optional[Dict] = None,
    ) -> bool:
        """Send verification failure email notification."""
        try:
            subject = "⚠️ Verification Failed - Action Required"

            # Create HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verification Failed</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .warning-icon {{ font-size: 48px; margin-bottom: 20px; }}
                    .button {{ display: inline-block; background: #ff6b6b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                    .error-box {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ Verification Failed</h1>
                        <p>Action Required</p>
                    </div>
                    <div class="content">
                        <div class="warning-icon">❌</div>
                        <h2>Hello {to_name},</h2>
                        <p>We encountered an issue while verifying your <strong>{verification_type}</strong>.</p>
                        
                        <div class="error-box">
                            <strong>Error Details:</strong><br>
                            {failure_reason}
                        </div>
                        
                        <p>Don't worry! This is usually easy to fix. Here are some common solutions:</p>
                        <ul>
                            <li>Check that your {verification_type} address is correct</li>
                            <li>Ensure the verification link hasn't expired</li>
                            <li>Try using a different browser or device</li>
                            <li>Clear your browser cache and cookies</li>
                        </ul>
                        
                        {"<p><strong>You can retry the verification process:</strong></p><p><a href=\"" + os.getenv('FRONTEND_URL', 'https://app.yoursecretissafe.com') + "/auth/verify-email\" class=\"button\">Retry Verification</a></p>" if retry_available else "<p><strong>Please contact support for assistance.</strong></p>"}
                        
                        <p>If you continue to experience issues, please contact our support team and we'll be happy to help.</p>
                        <p><strong>The Secret Safe Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This email was sent to {to_email}</p>
                        <p>© 2025 Secret Safe. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """

            # Create plain text content
            retry_message = (
                f"You can retry the verification process: {os.getenv('FRONTEND_URL', 'https://app.yoursecretissafe.com')}/auth/verify-email"
                if retry_available
                else "Please contact support for assistance."
            )

            text_content = f"""
            Verification Failed - Action Required
            
            Hello {to_name},
            
            We encountered an issue while verifying your {verification_type}.
            
            Error Details: {failure_reason}
            
            Don't worry! This is usually easy to fix. Here are some common solutions:
            - Check that your {verification_type} address is correct
            - Ensure the verification link hasn't expired
            - Try using a different browser or device
            - Clear your browser cache and cookies
            
            {retry_message}
            
            If you continue to experience issues, please contact our support team and we'll be happy to help.
            
            The Secret Safe Team
            
            This email was sent to {to_email}
            © 2025 Secret Safe. All rights reserved.
            """

            return await self.send_email(
                to_email=to_email,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
            )

        except Exception as e:
            logger.error(f"Error sending verification failure email: {e}")
            return False

    async def send_verification_reminder_email(
        self,
        to_email: str,
        to_name: str,
        verification_type: str = "email",
        days_since_registration: int = 0,
        additional_data: Optional[Dict] = None,
    ) -> bool:
        """Send verification reminder email notification."""
        try:
            subject = "🔔 Complete Your Verification - Secret Safe"

            # Create HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Complete Your Verification</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .reminder-icon {{ font-size: 48px; margin-bottom: 20px; }}
                    .button {{ display: inline-block; background: #74b9ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                    .highlight {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 Verification Reminder</h1>
                        <p>Complete Your Setup</p>
                    </div>
                    <div class="content">
                        <div class="reminder-icon">⏰</div>
                        <h2>Hello {to_name},</h2>
                        <p>We noticed you haven't completed your <strong>{verification_type}</strong> verification yet.</p>
                        
                        <div class="highlight">
                            <strong>Why verify?</strong><br>
                            Verification ensures your account security and unlocks all Secret Safe features.
                        </div>
                        
                        <p>You're just one step away from accessing:</p>
                        <ul>
                            <li>🔐 Secure message storage</li>
                            <li>📱 Cross-platform access</li>
                            <li>🛡️ Advanced security features</li>
                            <li>📊 Message analytics</li>
                        </ul>
                        
                        <p><a href="{os.getenv('FRONTEND_URL', 'https://app.yoursecretissafe.com')}/auth/verify-email" class="button">Complete Verification Now</a></p>
                        
                        <p><strong>Need help?</strong> Our support team is here to assist you with any verification issues.</p>
                        
                        <p>Best regards,<br><strong>The Secret Safe Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This email was sent to {to_email}</p>
                        <p>© 2025 Secret Safe. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """

            # Create plain text content
            text_content = f"""
            Complete Your Verification - Secret Safe
            
            Hello {to_name},
            
            We noticed you haven't completed your {verification_type} verification yet.
            
            Why verify?
            Verification ensures your account security and unlocks all Secret Safe features.
            
            You're just one step away from accessing:
            - Secure message storage
            - Cross-platform access
            - Advanced security features
            - Message analytics
            
            Complete verification now: {os.getenv('FRONTEND_URL', 'https://app.yoursecretissafe.com')}/auth/verify-email
            
            Need help? Our support team is here to assist you with any verification issues.
            
            Best regards,
            The Secret Safe Team
            
            This email was sent to {to_email}
            © 2025 Secret Safe. All rights reserved.
            """

            return await self.send_email(
                to_email=to_email,
                subject=subject,
                html_content=html_content,
                text_content=text_content,
            )

        except Exception as e:
            logger.error(f"Error sending verification reminder email: {e}")
            return False


# Global email service instance
email_service = EmailService()
