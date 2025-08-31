#!/usr/bin/env python3
"""
Test Supabase connection and configuration
"""

import os
import sys
from pathlib import Path

# Load environment variables from .env file
from dotenv import load_dotenv

load_dotenv()

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))


def test_supabase_config():
    """Test Supabase configuration"""
    print("🔐 Testing Supabase Configuration")
    print("=" * 40)

    # Check environment variables
    required_vars = [
        "DATABASE_URL",
        "SUPABASE_URL",
        "SUPABASE_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
    ]

    print("Environment Variables:")
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if "key" in var.lower() or "password" in var.lower():
                masked_value = (
                    value[:8] + "..." + value[-4:] if len(value) > 12 else "***"
                )
                print(f"  ✅ {var}: {masked_value}")
            else:
                print(f"  ✅ {var}: {value}")
        else:
            print(f"  ❌ {var}: NOT SET")

    print()

    # Test Supabase connection
    try:
        from app.config.supabase import (get_supabase_info,
                                         test_supabase_connection)

        print("Supabase Connection Test:")
        info = get_supabase_info()
        print(f"  URL: {info['url']}")
        print(f"  Has anon key: {info['has_anon_key']}")
        print(f"  Has service key: {info['has_service_key']}")
        print(f"  Has database URL: {info['has_database_url']}")

        print()
        print("Testing connection...")
        connection_test = test_supabase_connection()

        if connection_test["status"] == "connected":
            print("  ✅ Supabase connection successful!")
            print(f"  Features enabled: {connection_test['features']}")
        else:
            print(
                f"  ❌ Supabase connection failed: {connection_test.get('error', 'Unknown error')}"
            )

    except ImportError as e:
        print(f"  ❌ Could not import Supabase config: {e}")
    except Exception as e:
        print(f"  ❌ Error testing Supabase: {e}")

    print()
    print("=" * 40)


if __name__ == "__main__":
    test_supabase_config()
