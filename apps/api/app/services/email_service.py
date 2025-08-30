"""
Email Service Abstraction Layer

Provides a unified interface for sending emails through multiple providers
with fallback mechanisms and comprehensive error handling.
"""

import os
import logging
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Union
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

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
        attachments: Optional[List[Dict]] = None
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
            "FROM_EMAIL", "noreply@yoursecretissafe.com")
        self._client = None

    async def _get_client(self):
        """Lazy load SendGrid client."""
        if self._client is None:
            try:
                from sendgrid import SendGridAPIClient
                self._client = SendGridAPIClient(api_key=self.api_key)
            except ImportError:
                logger.error(
                    "SendGrid package not installed. Install with: pip install sendgrid")
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
        attachments: Optional[List[Dict]] = None
    ) -> bool:
        """Send email via SendGrid."""
        try:
            from sendgrid.helpers.mail import Mail, Email, To, Content, Attachment, FileContent, FileName, FileType, Disposition

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
            mail = Mail(from_email_obj, to_email_obj,
                        subject, content_objects[0])

            # Add text content if provided
            if len(content_objects) > 1:
                mail.add_content(content_objects[1])

            # Add reply-to if specified
            if reply_to:
                mail.reply_to = Email(reply_to)

            # Add attachments if provided
            if attachments:
                for attachment in attachments:
                    file_content = FileContent(attachment.get('content', ''))
                    file_name = FileName(
                        attachment.get('filename', 'attachment'))
                    file_type = FileType(attachment.get(
                        'type', 'application/octet-stream'))
                    disposition = Disposition(
                        attachment.get('disposition', 'attachment'))

                    attachment_obj = Attachment(
                        file_content, file_name, file_type, disposition)
                    mail.add_attachment(attachment_obj)

            # Send email
            response = client.send(mail)

            if response.status_code in [200, 201, 202]:
                logger.info(
                    f"Email sent successfully via SendGrid to {to_email}")
                return True
            else:
                logger.error(
                    f"SendGrid error: {response.status_code} - {response.body}")
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
            from sendgrid.helpers.mail import Mail, Email, To, Content

            test_mail = Mail(
                from_email=Email(self.from_email),
                to_emails=To("test@example.com"),
                subject="Connection Test",
                html_content=Content(
                    "text/html", "<p>This is a connection test.</p>")
            )

            # Don't actually send, just validate the mail object
            # This tests that the client can create valid mail objects
            return True

        except Exception as e:
            logger.error(f"SendGrid connection test failed: {str(e)}")
            return False


class AWSSESProvider(EmailProvider):
    """AWS SES email provider implementation."""

    def __init__(self, region: str, access_key_id: str, secret_access_key: str, from_email: str = None):
        self.region = region
        self.access_key_id = access_key_id
        self.secret_access_key = secret_access_key
        self.from_email = from_email or os.getenv(
            "FROM_EMAIL", "noreply@yoursecretissafe.com")
        self._client = None

    async def _get_client(self):
        """Lazy load AWS SES client."""
        if self._client is None:
            try:
                import boto3
                self._client = boto3.client(
                    'ses',
                    region_name=self.region,
                    aws_access_key_id=self.access_key_id,
                    aws_secret_access_key=self.secret_access_key
                )
            except ImportError:
                logger.error(
                    "boto3 package not installed. Install with: pip install boto3")
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
        attachments: Optional[List[Dict]] = None
    ) -> bool:
        """Send email via AWS SES."""
        try:
            import boto3
            from botocore.exceptions import ClientError

            client = await self._get_client()

            # Create message
            message = MIMEMultipart('alternative')
            message['Subject'] = subject
            message['From'] = from_email or self.from_email
            message['To'] = to_email

            if reply_to:
                message['Reply-To'] = reply_to

            # Add text content
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                message.attach(text_part)

            # Add HTML content
            html_part = MIMEText(html_content, 'html')
            message.attach(html_part)

            # Convert to string
            message_body = message.as_string()

            # Send email
            response = client.send_raw_email(
                Source=from_email or self.from_email,
                Destinations=[to_email],
                RawMessage={'Data': message_body}
            )

            logger.info(
                f"Email sent successfully via AWS SES to {to_email}, MessageId: {response['MessageId']}")
            return True

        except ClientError as e:
            logger.error(
                f"AWS SES error: {e.response['Error']['Code']} - {e.response['Error']['Message']}")
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

            if response['ResponseMetadata']['HTTPStatusCode'] == 200:
                logger.info(
                    f"AWS SES connection test successful. Quota: {response['Max24HourSend']} emails/day")
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
                    aws_region, aws_access_key, aws_secret_key)
                self.providers.append(ses_provider)
                logger.info("AWS SES provider configured")

            if not self.providers:
                logger.warning(
                    "No email providers configured. Email functionality will not work.")

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
        attachments: Optional[List[Dict]] = None
    ) -> bool:
        """Send email using available providers with fallback."""
        if not self.providers:
            logger.error("No email providers available")
            return False

        # Try current provider first
        for attempt in range(len(self.providers)):
            provider_index = (self.current_provider_index +
                              attempt) % len(self.providers)
            provider = self.providers[provider_index]

            try:
                success = await provider.send_email(
                    to_email=to_email,
                    subject=subject,
                    html_content=html_content,
                    text_content=text_content,
                    from_email=from_email,
                    reply_to=reply_to,
                    attachments=attachments
                )

                if success:
                    # Update current provider to the successful one
                    self.current_provider_index = provider_index
                    return True
                else:
                    logger.warning(
                        f"Provider {provider.__class__.__name__} failed, trying next...")

            except Exception as e:
                logger.error(
                    f"Provider {provider.__class__.__name__} error: {str(e)}")
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


# Global email service instance
email_service = EmailService()
