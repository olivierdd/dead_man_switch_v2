"""
Email Templates for Secret Safe Platform

Professional email templates for verification, password reset, and other notifications.
Uses Jinja2 templating for dynamic content and responsive design.
"""

from jinja2 import Template
from typing import Dict, Any, Optional
import os


class EmailTemplateManager:
    """Manages email templates with Jinja2 rendering."""

    def __init__(self):
        self.templates = self._load_templates()

    def _load_templates(self) -> Dict[str, Dict[str, Template]]:
        """Load all email templates."""
        return {
            "email_verification": {
                "html": self._get_verification_html_template(),
                "text": self._get_verification_text_template()
            },
            "password_reset": {
                "html": self._get_password_reset_html_template(),
                "text": self._get_password_reset_text_template()
            },
            "welcome": {
                "html": self._get_welcome_html_template(),
                "text": self._get_welcome_text_template()
            },
            "email_change": {
                "html": self._get_email_change_html_template(),
                "text": self._get_email_change_text_template()
            }
        }

    def render_template(
        self,
        template_name: str,
        template_type: str,
        context: Dict[str, Any]
    ) -> str:
        """Render a template with the given context."""
        if template_name not in self.templates:
            raise ValueError(f"Template '{template_name}' not found")

        if template_type not in self.templates[template_name]:
            raise ValueError(
                f"Template type '{template_type}' not found for '{template_name}'")

        template = self.templates[template_name][template_type]
        return template.render(**context)

    def _get_verification_html_template(self) -> Template:
        """HTML template for email verification."""
        return Template("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Secret Safe</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .verification-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .verification-button:hover {
            transform: translateY(-2px);
        }
        .verification-link {
            word-break: break-all;
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 14px;
            color: #64748b;
            margin: 20px 0;
        }
        .info-box {
            background-color: #f1f5f9;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        @media (max-width: 600px) {
            .container {
                margin: 20px;
                border-radius: 8px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐</div>
            <h1>Verify Your Email</h1>
            <p>Welcome to Secret Safe - Your Digital Inheritance Platform</p>
        </div>
        
        <div class="content">
            <h2>Hello {{ user.first_name or user.email }},</h2>
            
            <p>Thank you for signing up for Secret Safe! To complete your registration and start securing your digital legacy, please verify your email address.</p>
            
            <div style="text-align: center;">
                <a href="{{ verification_url }}" class="verification-button">
                    Verify Email Address
                </a>
            </div>
            
            <p><strong>Verification Link:</strong></p>
            <div class="verification-link">
                {{ verification_url }}
            </div>
            
            <div class="info-box">
                <strong>What happens next?</strong><br>
                After verifying your email, you'll be able to:
                <ul>
                    <li>Create and manage your secret messages</li>
                    <li>Set up check-in schedules</li>
                    <li>Configure recipients for your messages</li>
                    <li>Access your secure vault</li>
                </ul>
            </div>
            
            <p><strong>Important:</strong> This verification link will expire in <strong>{{ expiry_hours }} hours</strong>. If you need a new link, you can request one from your account settings.</p>
            
            <p>If you didn't create a Secret Safe account, you can safely ignore this email.</p>
            
            <p>Best regards,<br>
            <strong>The Secret Safe Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This email was sent to {{ user.email }}</p>
            <p>© 2025 Secret Safe. All rights reserved.</p>
            <p>
                <a href="{{ base_url }}/privacy">Privacy Policy</a> | 
                <a href="{{ base_url }}/terms">Terms of Service</a> | 
                <a href="{{ base_url }}/support">Support</a>
            </p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_verification_text_template(self) -> Template:
        """Plain text template for email verification."""
        return Template("""
SECRET SAFE - EMAIL VERIFICATION

Hello {{ user.first_name or user.email }},

Thank you for signing up for Secret Safe! To complete your registration and start securing your digital legacy, please verify your email address.

VERIFICATION LINK:
{{ verification_url }}

What happens next?
After verifying your email, you'll be able to:
- Create and manage your secret messages
- Set up check-in schedules
- Configure recipients for your messages
- Access your secure vault

Important: This verification link will expire in {{ expiry_hours }} hours. If you need a new link, you can request one from your account settings.

If you didn't create a Secret Safe account, you can safely ignore this email.

Best regards,
The Secret Safe Team

---
This email was sent to {{ user.email }}
© 2025 Secret Safe. All rights reserved.
{{ base_url }}/privacy | {{ base_url }}/terms | {{ base_url }}/support
        """)

    def _get_password_reset_html_template(self) -> Template:
        """HTML template for password reset."""
        return Template("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Secret Safe</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .reset-button:hover {
            transform: translateY(-2px);
        }
        .security-notice {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐</div>
            <h1>Reset Your Password</h1>
            <p>Secret Safe Account Security</p>
        </div>
        
        <div class="content">
            <h2>Hello {{ user.first_name or user.email }},</h2>
            
            <p>We received a request to reset your Secret Safe account password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="{{ reset_url }}" class="reset-button">
                    Reset Password
                </a>
            </div>
            
            <div class="security-notice">
                <strong>Security Notice:</strong><br>
                This password reset link will expire in {{ expiry_hours }} hours for your security. If you didn't request this reset, please ignore this email and ensure your account is secure.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">{{ reset_url }}</p>
            
            <p>Best regards,<br>
            <strong>The Secret Safe Security Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This email was sent to {{ user.email }}</p>
            <p>© 2025 Secret Safe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_password_reset_text_template(self) -> Template:
        """Plain text template for password reset."""
        return Template("""
SECRET SAFE - PASSWORD RESET

Hello {{ user.first_name or user.email }},

We received a request to reset your Secret Safe account password. Use the link below to create a new password:

{{ reset_url }}

Security Notice:
This password reset link will expire in {{ expiry_hours }} hours for your security. If you didn't request this reset, please ignore this email and ensure your account is secure.

Best regards,
The Secret Safe Security Team

---
This email was sent to {{ user.email }}
© 2025 Secret Safe. All rights reserved.
        """)

    def _get_welcome_html_template(self) -> Template:
        """HTML template for welcome email after verification."""
        return Template("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Secret Safe!</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .feature-box {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎉</div>
            <h1>Welcome to Secret Safe!</h1>
            <p>Your account is now verified and ready to use</p>
        </div>
        
        <div class="content">
            <h2>Congratulations, {{ user.first_name or user.email }}!</h2>
            
            <p>Your Secret Safe account has been successfully verified. You're now ready to start securing your digital legacy and ensuring your important messages reach their intended recipients.</p>
            
            <div style="text-align: center;">
                <a href="{{ dashboard_url }}" class="cta-button">
                    Go to Dashboard
                </a>
            </div>
            
            <div class="feature-box">
                <strong>What you can do now:</strong><br>
                <ul>
                    <li>🔐 Create your first secret message</li>
                    <li>👥 Add trusted recipients</li>
                    <li>⏰ Set up check-in schedules</li>
                    <li>📁 Organize your secure vault</li>
                    <li>⚙️ Customize your account settings</li>
                </ul>
            </div>
            
            <p><strong>Getting Started:</strong></p>
            <ol>
                <li>Visit your dashboard to see the platform overview</li>
                <li>Create your first message with our guided wizard</li>
                <li>Add recipients who should receive your messages</li>
                <li>Set up your check-in schedule</li>
                <li>Explore advanced features as you become comfortable</li>
            </ol>
            
            <p>If you have any questions or need help getting started, our support team is here to help!</p>
            
            <p>Welcome aboard!<br>
            <strong>The Secret Safe Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© 2025 Secret Safe. All rights reserved.</p>
            <p>
                <a href="{{ base_url }}/support">Support</a> | 
                <a href="{{ base_url }}/docs">Documentation</a> | 
                <a href="{{ base_url }}/community">Community</a>
            </p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_welcome_text_template(self) -> Template:
        """Plain text template for welcome email."""
        return Template("""
WELCOME TO SECRET SAFE!

Congratulations, {{ user.first_name or user.email }}!

Your Secret Safe account has been successfully verified. You're now ready to start securing your digital legacy and ensuring your important messages reach their intended recipients.

Go to Dashboard: {{ dashboard_url }}

What you can do now:
- Create your first secret message
- Add trusted recipients
- Set up check-in schedules
- Organize your secure vault
- Customize your account settings

Getting Started:
1. Visit your dashboard to see the platform overview
2. Create your first message with our guided wizard
3. Add recipients who should receive your messages
4. Set up your check-in schedule
5. Explore advanced features as you become comfortable

If you have any questions or need help getting started, our support team is here to help!

Welcome aboard!
The Secret Safe Team

---
© 2025 Secret Safe. All rights reserved.
{{ base_url }}/support | {{ base_url }}/docs | {{ base_url }}/community
        """)

    def _get_email_change_html_template(self) -> Template:
        """HTML template for email change verification."""
        return Template("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Email Change - Secret Safe</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .verify-button:hover {
            transform: translateY(-2px);
        }
        .info-box {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📧</div>
            <h1>Verify Email Change</h1>
            <p>Secret Safe Account Update</p>
        </div>
        
        <div class="content">
            <h2>Hello {{ user.first_name or user.email }},</h2>
            
            <p>We received a request to change your email address from <strong>{{ old_email }}</strong> to <strong>{{ new_email }}</strong>.</p>
            
            <p>To confirm this change, please click the button below:</p>
            
            <div style="text-align: center;">
                <a href="{{ verification_url }}" class="verify-button">
                    Confirm Email Change
                </a>
            </div>
            
            <div class="info-box">
                <strong>What happens next?</strong><br>
                After confirming this change:
                <ul>
                    <li>Your email address will be updated to {{ new_email }}</li>
                    <li>You'll need to use the new email for future logins</li>
                    <li>All notifications will be sent to the new address</li>
                </ul>
            </div>
            
            <p><strong>Important:</strong> This verification link will expire in <strong>{{ expiry_hours }} hours</strong>.</p>
            
            <p>If you didn't request this email change, please ignore this email and contact our support team immediately.</p>
            
            <p>Best regards,<br>
            <strong>The Secret Safe Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This email was sent to {{ new_email }}</p>
            <p>© 2025 Secret Safe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        """)

    def _get_email_change_text_template(self) -> Template:
        """Plain text template for email change verification."""
        return Template("""
SECRET SAFE - EMAIL CHANGE VERIFICATION

Hello {{ user.first_name or user.email }},

We received a request to change your email address from {{ old_email }} to {{ new_email }}.

To confirm this change, please use this link:
{{ verification_url }}

What happens next?
After confirming this change:
- Your email address will be updated to {{ new_email }}
- You'll need to use the new email for future logins
- All notifications will be sent to the new address

Important: This verification link will expire in {{ expiry_hours }} hours.

If you didn't request this email change, please ignore this email and contact our support team immediately.

Best regards,
The Secret Safe Team

---
This email was sent to {{ new_email }}
© 2025 Secret Safe. All rights reserved.
        """)


# Global template manager instance
email_template_manager = EmailTemplateManager()
