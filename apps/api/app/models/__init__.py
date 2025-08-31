# Models package initialization
# Using lazy imports to avoid circular dependencies

from .database import (DatabaseMigrations, DatabaseModels, DatabaseUtils,
                       check_database_health, create_database_engine, drop_db,
                       get_db, init_db)
from .message import (DissolutionAction, DissolutionPlan, MessageAttachment,
                      MessageAuditLog, MessageCheckIn, MessageCreate,
                      MessagePriority, MessageResponse, MessageSearch,
                      MessageShare, MessageShareCreate, MessageStatus,
                      MessageType, MessageUpdate, Recipient, RecipientCreate)
from .user import (CheckIn, RoleChangeLog, SubscriptionTier, UserAuditLog,
                   UserCheckIn, UserCreate, UserLogin, UserPasswordUpdate,
                   UserPermission, UserProfile, UserRole, UserRoleUpdate,
                   UserSession, UserSuspension, UserUpdate)

# Import main models with lazy loading to avoid circular imports


def get_user_model():
    """Lazy import of User model to avoid circular imports"""
    from .user import User

    return User


def get_message_model():
    """Lazy import of Message model to avoid circular imports"""
    from .message import Message

    return Message


# Import database utilities

__all__ = [
    # User models
    "UserRole",
    "UserProfile",
    "UserCreate",
    "UserUpdate",
    "UserRoleUpdate",
    "UserPasswordUpdate",
    "UserLogin",
    "UserCheckIn",
    "UserSuspension",
    "RoleChangeLog",
    "UserPermission",
    "CheckIn",
    "UserAuditLog",
    "UserSession",
    "SubscriptionTier",
    # Message models
    "MessageStatus",
    "DissolutionAction",
    "MessageShare",
    "Recipient",
    "DissolutionPlan",
    "MessageCreate",
    "MessageUpdate",
    "MessageShareCreate",
    "RecipientCreate",
    "MessageResponse",
    "MessageCheckIn",
    "MessageSearch",
    "MessagePriority",
    "MessageType",
    "MessageAttachment",
    "MessageAuditLog",
    # Lazy loading functions
    "get_user_model",
    "get_message_model",
    # Database utilities
    "create_database_engine",
    "get_db",
    "init_db",
    "drop_db",
    "DatabaseUtils",
    "DatabaseModels",
    "DatabaseMigrations",
    "check_database_health",
]
