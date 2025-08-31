#!/usr/bin/env python3
"""
Test Email Service

Simple script to test the email service functionality and verify
that emails can be sent through the configured providers.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))


async def test_email_service():
    """Test the email service functionality."""
    try:
        from app.services.email_service import email_service
        from app.services.email_templates import email_template_manager

        print("🔐 Testing Secret Safe Email Service")
        print("=" * 50)

        # Test 1: Check email service configuration
        print("\n1. Checking email service configuration...")
        provider_status = email_service.get_provider_status()

        if not provider_status:
            print("❌ No email providers configured!")
            print(
                "Please set up SENDGRID_API_KEY or AWS credentials in your environment."
            )
            return False

        print("✅ Email providers found:")
        for provider, status in provider_status.items():
            print(f"   - {provider}: {status}")

        # Test 2: Test provider connections
        print("\n2. Testing provider connections...")
        connection_results = await email_service.test_all_providers()

        for provider, result in connection_results.items():
            if result:
                print(f"   ✅ {provider}: Connection successful")
            else:
                print(f"   ❌ {provider}: Connection failed")

        # Test 3: Test email templates
        print("\n3. Testing email templates...")
        try:
            # Test verification email template
            test_context = {
                "user": type(
                    "User",
                    (),
                    {
                        "email": "test@example.com",
                        "first_name": "Test",
                        "last_name": "User",
                    },
                )(),
                "verification_url": "https://example.com/verify?token=test123",
                "base_url": "https://example.com",
                "expiry_hours": 24,
            }

            html_content = email_template_manager.render_template(
                "email_verification", "html", test_context
            )
            text_content = email_template_manager.render_template(
                "email_verification", "text", test_context
            )

            print("   ✅ Email templates rendered successfully")
            print(f"   - HTML length: {len(html_content)} characters")
            print(f"   - Text length: {len(text_content)} characters")

        except Exception as e:
            print(f"   ❌ Email template rendering failed: {e}")
            return False

        # Test 4: Test email sending (if test email provided)
        test_email = os.getenv("TEST_EMAIL")
        if test_email:
            print(f"\n4. Testing email sending to {test_email}...")

            try:
                success = await email_service.send_email(
                    to_email=test_email,
                    subject="Secret Safe Email Service Test",
                    html_content="""
                    <html>
                    <body>
                        <h1>Email Service Test</h1>
                        <p>This is a test email to verify the Secret Safe email service is working correctly.</p>
                        <p>If you received this email, the service is configured and functioning properly!</p>
                        <p>Sent at: {timestamp}</p>
                    </body>
                    </html>
                    """.format(
                        timestamp=asyncio.get_event_loop().time()
                    ),
                    text_content=f"""
                    Secret Safe Email Service Test
                    
                    This is a test email to verify the Secret Safe email service is working correctly.
                    
                    If you received this email, the service is configured and functioning properly!
                    
                    Sent at: {asyncio.get_event_loop().time()}
                    """,
                )

                if success:
                    print("   ✅ Test email sent successfully!")
                    print("   Check your inbox for the test email.")
                else:
                    print("   ❌ Test email sending failed")
                    return False

            except Exception as e:
                print(f"   ❌ Test email sending error: {e}")
                return False
        else:
            print("\n4. Skipping email sending test (TEST_EMAIL not set)")
            print(
                "   Set TEST_EMAIL environment variable to test actual email delivery"
            )

        # Test 5: Test verification service
        print("\n5. Testing verification service...")
        try:
            from app.models.verification import TokenType
            from app.services.verification_service import VerificationService

            print("   ✅ Verification service imported successfully")
            print("   ✅ Token types available:")
            for token_type in TokenType:
                print(f"      - {token_type.value}")

        except Exception as e:
            print(f"   ❌ Verification service test failed: {e}")
            return False

        print("\n" + "=" * 50)
        print("🎉 Email service testing completed successfully!")
        print("\nNext steps:")
        print("1. Configure your email provider credentials")
        print("2. Test with a real email address")
        print("3. Verify email delivery and formatting")

        return True

    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you're running this script from the correct directory")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def main():
    """Main function to run the email service test."""
    print("Starting email service test...")

    # Check environment variables
    print("\nEnvironment check:")
    if os.getenv("SENDGRID_API_KEY"):
        print("   ✅ SENDGRID_API_KEY is set")
    else:
        print("   ⚠️  SENDGRID_API_KEY not set")

    if os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY"):
        print("   ✅ AWS credentials are set")
    else:
        print("   ⚠️  AWS credentials not set")

    if os.getenv("FROM_EMAIL"):
        print("   ✅ FROM_EMAIL is set")
    else:
        print("   ⚠️  FROM_EMAIL not set (will use default)")

    if os.getenv("TEST_EMAIL"):
        print("   ✅ TEST_EMAIL is set")
    else:
        print("   ⚠️  TEST_EMAIL not set (will skip email delivery test)")

    # Run the test
    success = asyncio.run(test_email_service())

    if success:
        print("\n✅ All tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
