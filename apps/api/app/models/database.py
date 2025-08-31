"""
Database schema and configuration for Secret Safe API
Comprehensive SQLModel setup with proper indexing and relationships
"""

import os
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Index, Session, SQLModel, create_engine

from .message import (DissolutionPlan, Message, MessageAttachment,
                      MessageAuditLog, MessageCheckIn, MessageCreate,
                      MessageResponse, MessageSearch, MessageShare,
                      MessageShareCreate, MessageUpdate, Recipient,
                      RecipientCreate)
# Import all models to ensure they're registered with SQLModel
from .user import (CheckIn, RoleChangeLog, User, UserAuditLog, UserCheckIn,
                   UserCreate, UserLogin, UserPasswordUpdate, UserPermission,
                   UserProfile, UserRoleUpdate, UserSession, UserSuspension,
                   UserUpdate)

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://user:password@localhost/secret_safe"
)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ENABLE_RLS = os.getenv("SUPABASE_ENABLE_RLS", "true").lower() == "true"


# Create database engine function (not at module import time)
def create_database_engine():
    """Create database engine with current environment variables"""
    # Reload environment variables to get the latest values
    from dotenv import load_dotenv

    load_dotenv()

    # Get the current DATABASE_URL
    current_database_url = os.getenv("DATABASE_URL", DATABASE_URL)

    # Parse connection string to extract components for manual connection
    if current_database_url.startswith("postgresql://"):
        try:
            # Extract components manually to avoid parsing issues
            parts = current_database_url.replace("postgresql://", "").split("@")
            if len(parts) == 2:
                user_pass = parts[0]
                host_port_db = parts[1]

                user_pass_parts = user_pass.split(":")
                if len(user_pass_parts) == 2:
                    user = user_pass_parts[0]
                    password = user_pass_parts[1]

                    host_port_db_parts = host_port_db.split("/")
                    if len(host_port_db_parts) == 2:
                        host_port = host_port_db_parts[0]
                        database = host_port_db_parts[1]

                        host_port_parts = host_port.split(":")
                        if len(host_port_parts) == 2:
                            host = host_port_parts[0]
                            port = int(host_port_parts[1])

                            # Use manual connection parameters to avoid parsing issues
                            return create_engine(
                                f"postgresql://{user}:{password}@{host}:{port}/{database}",
                                echo=os.getenv("DEBUG", "false").lower() == "true",
                                pool_pre_ping=True,
                                pool_recycle=3600,
                                # Supabase-specific optimizations
                                pool_size=20,
                                max_overflow=30,
                                pool_timeout=30,
                                # Disable prepared statements for transaction pooler compatibility
                                connect_args={
                                    "prepare_threshold": None,
                                    "options": "-c statement_timeout=30000",
                                },
                            )
        except Exception as e:
            # Fall through to fallback method
            pass

    # Fallback to original method if parsing fails
    return create_engine(
        current_database_url,
        echo=os.getenv("DEBUG", "false").lower() == "true",  # SQL logging in debug mode
        pool_pre_ping=True,  # Verify connections before use
        pool_recycle=3600,  # Recycle connections every hour
        # Supabase-specific optimizations
        pool_size=20,  # Connection pool size for Supabase
        max_overflow=30,  # Maximum overflow connections
        pool_timeout=30,  # Connection timeout
        # Disable prepared statements for transaction pooler compatibility
        connect_args={
            "prepare_threshold": None,
            "options": "-c statement_timeout=30000",
        },
    )


# Database session dependency


def get_db():
    """Get database session"""
    engine = create_database_engine()
    with Session(engine) as session:
        yield session


# Database initialization


def init_db():
    """Initialize database tables"""
    engine = create_database_engine()
    SQLModel.metadata.create_all(engine)

    # If using Supabase, enable RLS and set up policies
    if SUPABASE_URL and SUPABASE_ENABLE_RLS:
        setup_supabase_rls()


def drop_db():
    """Drop all database tables (use with caution!)"""
    engine = create_database_engine()
    SQLModel.metadata.drop_all(engine)


def setup_supabase_rls():
    """Set up Row Level Security policies for Supabase"""
    try:
        from .supabase_rls import setup_rls_policies

        setup_rls_policies()
    except ImportError:
        print("Supabase RLS setup not available")


# Custom indexes for better performance


class DatabaseIndexes:
    """Custom database indexes for optimization"""

    # User indexes
    USER_EMAIL_INDEX = Index("idx_user_email", "user.email")
    USER_ROLE_INDEX = Index("idx_user_role", "user.role")
    USER_STATUS_INDEX = Index("idx_user_status", "user.is_active", "user.is_suspended")
    USER_SUBSCRIPTION_INDEX = Index(
        "idx_user_subscription",
        "user.subscription_tier",
        "user.subscription_expires_at",
    )
    USER_CHECKIN_INDEX = Index(
        "idx_user_checkin", "user.last_check_in", "user.check_in_interval"
    )

    # Message indexes
    MESSAGE_USER_STATUS_INDEX = Index(
        "idx_message_user_status", "message.user_id", "message.status"
    )
    MESSAGE_TYPE_PRIORITY_INDEX = Index(
        "idx_message_type_priority", "message.message_type", "message.priority"
    )
    MESSAGE_CHECKIN_INDEX = Index(
        "idx_message_checkin", "message.last_check_in", "message.next_check_in_deadline"
    )
    MESSAGE_EXPIRY_INDEX = Index(
        "idx_message_expiry", "message.expires_at", "message.status"
    )
    MESSAGE_SHARED_INDEX = Index(
        "idx_message_shared", "message.is_shared", "message.status"
    )

    # MessageShare indexes
    MESSAGESHARE_USER_INDEX = Index(
        "idx_messageshare_user",
        "messageshare.shared_with_user_id",
        "messageshare.expires_at",
    )
    MESSAGESHARE_MESSAGE_INDEX = Index(
        "idx_messageshare_message", "messageshare.message_id", "messageshare.shared_at"
    )

    # Recipient indexes
    RECIPIENT_EMAIL_INDEX = Index(
        "idx_recipient_email", "recipient.email", "recipient.delivery_status"
    )
    RECIPIENT_DELIVERY_INDEX = Index(
        "idx_recipient_delivery",
        "recipient.delivery_method",
        "recipient.delivery_status",
    )

    # Audit log indexes
    AUDIT_USER_ACTION_INDEX = Index(
        "idx_audit_user_action",
        "userauditlog.user_id",
        "userauditlog.action",
        "userauditlog.created_at",
    )
    AUDIT_MESSAGE_ACTION_INDEX = Index(
        "idx_audit_message_action",
        "messageauditlog.message_id",
        "messageauditlog.action",
        "messageauditlog.created_at",
    )

    # Session indexes
    SESSION_TOKEN_INDEX = Index(
        "idx_session_token", "usersession.session_token", "usersession.is_active"
    )
    SESSION_USER_INDEX = Index(
        "idx_session_user", "usersession.user_id", "usersession.expires_at"
    )

    # Attachment indexes
    ATTACHMENT_MESSAGE_INDEX = Index(
        "idx_attachment_message",
        "messageattachment.message_id",
        "messageattachment.file_hash",
    )
    ATTACHMENT_TYPE_INDEX = Index(
        "idx_attachment_type",
        "messageattachment.mime_type",
        "messageattachment.file_size",
    )


# Database models registry


class DatabaseModels:
    """Registry of all database models"""

    # Core models
    USER_MODELS = [
        User,
        RoleChangeLog,
        UserPermission,
        CheckIn,
        UserAuditLog,
        UserSession,
    ]

    # Message models
    MESSAGE_MODELS = [
        Message,
        MessageShare,
        Recipient,
        DissolutionPlan,
        MessageAttachment,
        MessageAuditLog,
    ]

    # All models
    ALL_MODELS = USER_MODELS + MESSAGE_MODELS

    @classmethod
    def get_all_models(cls):
        """Get all registered models"""
        return cls.ALL_MODELS

    @classmethod
    def get_user_models(cls):
        """Get user-related models"""
        return cls.USER_MODELS

    @classmethod
    def get_message_models(cls):
        """Get message-related models"""
        return cls.MESSAGE_MODELS


# Database utilities


class DatabaseUtils:
    """Utility functions for database operations"""

    @staticmethod
    def create_tables():
        """Create all database tables"""
        init_db()

    @staticmethod
    def drop_tables():
        """Drop all database tables"""
        drop_db()

    @staticmethod
    def reset_database():
        """Reset database (drop and recreate all tables)"""
        drop_db()
        init_db()

    @staticmethod
    def get_table_names():
        """Get names of all database tables"""
        return list(SQLModel.metadata.tables.keys())

    @staticmethod
    def get_table_info():
        """Get information about all database tables"""
        tables = {}
        for table_name, table in SQLModel.metadata.tables.items():
            tables[table_name] = {
                "name": table_name,
                "columns": [col.name for col in table.columns],
                "indexes": [idx.name for idx in table.indexes],
                "foreign_keys": [fk.target_fullname for fk in table.foreign_keys],
            }
        return tables


# Database health check


def check_database_health():
    """Check database connectivity and health"""
    try:
        with Session(create_database_engine()) as session:
            # Simple query to test connection
            session.execute("SELECT 1")

            # Get basic database info
            result = session.execute("SELECT version()")
            version = result.scalar()

            return {
                "status": "healthy",
                "database_url": DATABASE_URL,
                "supabase_url": SUPABASE_URL,
                "supabase_rls_enabled": SUPABASE_ENABLE_RLS,
                "tables": DatabaseUtils.get_table_names(),
                "connection": "active",
                "postgres_version": version.split()[1] if version else "unknown",
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database_url": DATABASE_URL,
            "supabase_url": SUPABASE_URL,
            "error": str(e),
            "connection": "failed",
        }


# Database migration utilities


class DatabaseMigrations:
    """Database migration utilities"""

    @staticmethod
    def get_current_schema_version():
        """Get current database schema version"""
        try:
            with Session(create_database_engine()) as session:
                # Check if schema_version table exists
                result = session.execute(
                    """
                    SELECT version FROM schema_version 
                    ORDER BY created_at DESC 
                    LIMIT 1
                """
                )
                row = result.fetchone()
                return row[0] if row else "0.0.0"
        except:
            return "0.0.0"

    @staticmethod
    def create_schema_version_table():
        """Create schema version tracking table"""
        with Session(create_database_engine()) as session:
            session.execute(
                """
                CREATE TABLE IF NOT EXISTS schema_version (
                    id SERIAL PRIMARY KEY,
                    version VARCHAR(20) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
            )
            session.commit()

    @staticmethod
    def record_migration(version: str, description: str = ""):
        """Record a database migration"""
        DatabaseMigrations.create_schema_version_table()
        with Session(create_database_engine()) as session:
            session.execute(
                """
                INSERT INTO schema_version (version, description)
                VALUES (%s, %s)
            """,
                (version, description),
            )
            session.commit()


# Export main components
__all__ = [
    # Database configuration
    "DATABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_ENABLE_RLS",
    "create_database_engine",
    "get_db",
    "init_db",
    "drop_db",
    # Database utilities
    "DatabaseUtils",
    "DatabaseModels",
    "DatabaseMigrations",
    # Health check
    "check_database_health",
    # Models (for convenience)
    "User",
    "Message",
    "MessageShare",
    "Recipient",
    "DissolutionPlan",
    "MessageAttachment",
    "MessageAuditLog",
    "RoleChangeLog",
    "UserPermission",
    "CheckIn",
    "UserAuditLog",
    "UserSession",
]
