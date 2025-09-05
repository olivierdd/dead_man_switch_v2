#!/usr/bin/env python3
"""
Test different email formats to understand Supabase validation rules
"""

import os
import sys
from supabase import create_client, Client
import json


def load_env_file():
    """Load environment variables from .env file"""
    env_file = os.path.join(os.path.dirname(__file__),
                            'apps', 'web', '.env.local')
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value


def connect_to_supabase() -> Client:
    """Connect to Supabase using environment variables"""
    load_env_file()

    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase environment variables!")
        sys.exit(1)

    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Connected to Supabase successfully!")
        return supabase
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        sys.exit(1)


def test_email_formats(supabase: Client):
    """Test different email formats to understand validation rules"""
    print("\n🧪 Testing different email formats...")

    test_emails = [
        "test@example.com",
        "user@test.com",
        "admin@localhost",
        "test@localhost.local",
        "user@domain.com",
        "test123@gmail.com",
        "user@yahoo.com",
        "admin@outlook.com",
        "test@supabase.com",
        "user@vercel.com"
    ]

    for email in test_emails:
        print(f"\n📧 Testing: {email}")
        try:
            result = supabase.auth.sign_up({
                "email": email,
                "password": "TestPassword123!",
                "options": {
                    "data": {
                        "first_name": "Test",
                        "last_name": "User",
                        "display_name": "Test User",
                        "role": "writer"
                    }
                }
            })

            if result.user:
                print(f"✅ SUCCESS: {email} - User created!")
                print(f"   User ID: {result.user.id}")
                print(
                    f"   Email confirmed: {result.user.email_confirmed_at is not None}")
            else:
                print(f"❌ FAILED: {email}")
                if hasattr(result, 'error') and result.error:
                    print(f"   Error: {result.error}")

        except Exception as e:
            print(f"❌ ERROR: {email} - {e}")


def check_supabase_settings(supabase: Client):
    """Check Supabase project settings"""
    print("\n⚙️ Checking Supabase project settings...")

    try:
        # Try to get project info
        result = supabase.rpc('get_project_info').execute()
        print("Project info:", result.data)
    except Exception as e:
        print(f"Could not get project info: {e}")

    # Test basic auth functionality
    try:
        print("\n🔐 Testing basic auth functionality...")

        # Try to get current user (should be None if not logged in)
        user = supabase.auth.get_user()
        print(f"Current user: {user}")

        # Try to list users (this might fail due to permissions)
        try:
            users = supabase.auth.admin.list_users()
            print(f"Total users: {len(users)}")
        except Exception as e:
            print(f"Cannot list users (expected): {e}")

    except Exception as e:
        print(f"Auth test error: {e}")


def main():
    """Main function"""
    print("🔍 Supabase Email Validation Tester")
    print("=" * 50)

    # Connect to Supabase
    supabase = connect_to_supabase()

    # Check settings
    check_supabase_settings(supabase)

    # Test email formats
    test_email_formats(supabase)

    print("\n✅ Email validation testing complete!")


if __name__ == "__main__":
    main()
