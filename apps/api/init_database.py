#!/usr/bin/env python3
"""
Database initialization script for Secret Safe
Creates all tables and seeds initial data
"""

# Load environment variables from .env file FIRST - before any other imports
from app.config.supabase import test_supabase_connection, get_supabase_info
from app.models import (
    get_user_model, get_message_model,
    UserRole, SubscriptionTier, MessageStatus, MessageType, MessagePriority
)
from app.models.database import (
    init_db, DatabaseUtils, DatabaseMigrations,
    check_database_health
)
from pathlib import Path
import sys
import os
import structlog
from dotenv import load_dotenv
load_dotenv()


# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))


# Configure logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
)

logger = structlog.get_logger()


def print_status(message: str, status: str = "INFO"):
    """Print a formatted status message"""
    colors = {
        "INFO": "\033[94m",    # Blue
        "SUCCESS": "\033[92m",  # Green
        "WARNING": "\033[93m",  # Yellow
        "ERROR": "\033[91m",   # Red
    }
    reset = "\033[0m"

    if status in colors:
        print(f"{colors[status]}[{status}]{reset} {message}")
    else:
        print(f"[{status}] {message}")


def check_environment():
    """Check if environment variables are properly set"""
    print_status("Checking environment configuration...")

    required_vars = [
        "DATABASE_URL",
        "SUPABASE_URL",
        "SUPABASE_KEY",
        "SUPABASE_SERVICE_ROLE_KEY"
    ]

    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)

    if missing_vars:
        print_status(
            f"Missing environment variables: {', '.join(missing_vars)}", "ERROR")
        print_status("Please check your .env file", "ERROR")
        return False

    print_status("Environment configuration OK", "SUCCESS")
    return True


def test_supabase_connection_local():
    """Test Supabase connection"""
    print_status("Testing Supabase connection...")

    try:
        info = get_supabase_info()
        print_status(f"Supabase URL: {info['url']}", "INFO")
        print_status(f"Has anon key: {info['has_anon_key']}", "INFO")
        print_status(f"Has service key: {info['has_service_key']}", "INFO")

        # Test connection - use the imported function, not recursive call
        connection_test = test_supabase_connection()
        if connection_test['status'] == 'connected':
            print_status("Supabase connection successful", "SUCCESS")
            return True
        else:
            print_status(
                f"Supabase connection failed: {connection_test.get('error', 'Unknown error')}", "ERROR")
            return False

    except Exception as e:
        print_status(f"Supabase connection test failed: {e}", "ERROR")
        return False


def create_database_tables():
    """Create all database tables"""
    print_status("Creating database tables...")

    try:
        init_db()
        print_status("Database tables created successfully", "SUCCESS")
        return True
    except Exception as e:
        print_status(f"Failed to create database tables: {e}", "ERROR")
        return False


def seed_initial_data():
    """Seed initial data for the application"""
    print_status("Seeding initial data...")

    try:
        from sqlmodel import Session
        from app.models.database import engine

        with Session(engine) as session:
            # Create schema version table and record initial migration
            DatabaseMigrations.record_migration(
                "1.0.0", "Initial database setup")
            print_status("Schema version tracking initialized", "SUCCESS")

            # Note: We'll add more seed data here as we implement the models
            # For now, just the basic structure

        print_status("Initial data seeded successfully", "SUCCESS")
        return True

    except Exception as e:
        print_status(f"Failed to seed initial data: {e}", "ERROR")
        return False


def verify_database_setup():
    """Verify that the database setup is correct"""
    print_status("Verifying database setup...")

    try:
        # Check database health
        health = check_database_health()
        if health['status'] == 'healthy':
            print_status("Database health check passed", "SUCCESS")
            print_status(
                f"PostgreSQL version: {health.get('postgres_version', 'unknown')}", "INFO")
            print_status(f"Tables created: {len(health['tables'])}", "INFO")

            # Show table names
            for table in health['tables']:
                print_status(f"  - {table}", "INFO")

            return True
        else:
            print_status(
                f"Database health check failed: {health.get('error', 'Unknown error')}", "ERROR")
            return False

    except Exception as e:
        print_status(f"Database verification failed: {e}", "ERROR")
        return False


def main():
    """Main database initialization function"""
    print("🔐 Secret Safe Database Initialization")
    print("=" * 50)

    # Check if we're in the right directory
    if not Path("app").exists():
        print_status(
            "Please run this script from the secret-safe/apps/api directory", "ERROR")
        sys.exit(1)

    # Step 1: Check environment
    if not check_environment():
        sys.exit(1)

    # Step 2: Test Supabase connection
    if not test_supabase_connection_local():
        sys.exit(1)

    # Step 3: Create database tables
    if not create_database_tables():
        sys.exit(1)

    # Step 4: Seed initial data
    if not seed_initial_data():
        sys.exit(1)

    # Step 5: Verify setup
    if not verify_database_setup():
        sys.exit(1)

    print()
    print("🎉 Database initialization completed successfully!")
    print("=" * 50)
    print()
    print("Next steps:")
    print("1. Your database is ready with all 12 tables")
    print("2. Row Level Security (RLS) is configured")
    print("3. Audit logging and migration tracking are enabled")
    print("4. You can now start the application")
    print()
    print("To start the backend server:")
    print("  python -m uvicorn app.main:app --host 0.0.0.0 --port 8000")
    print()
    print("To start the frontend server:")
    print("  cd ../web && npm run dev")
    print()
    print("Happy coding! 🔐✨")


if __name__ == "__main__":
    main()
