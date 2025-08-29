"""
Configuration settings for Secret Safe API
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "Secret Safe API"
    VERSION: str = "0.1.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://yourdomain.vercel.app"
    ]

    # Trusted Hosts
    ALLOWED_HOSTS: List[str] = [
        "localhost",
        "127.0.0.1",
        "yourdomain.vercel.app"
    ]

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/dbname"
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Email
    SENDGRID_API_KEY: Optional[str] = None
    FROM_EMAIL: str = "noreply@yoursecretissafe.com"

    # Blockchain (for Ultimate tier)
    WEB3_PROVIDER_URI: Optional[str] = None
    CONTRACT_ADDRESS: Optional[str] = None
    PRIVATE_KEY: Optional[str] = None

    # IPFS
    IPFS_GATEWAY_URL: str = "https://gateway.pinata.cloud"
    PINATA_API_KEY: Optional[str] = None
    PINATA_SECRET_KEY: Optional[str] = None

    # Monitoring
    SENTRY_DSN: Optional[str] = None

    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = [
        ".txt", ".pdf", ".jpg", ".png", ".doc", ".docx"]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create settings instance
settings = Settings()

# Override with environment variables if present
if os.getenv("DEBUG"):
    settings.DEBUG = os.getenv("DEBUG").lower() == "true"

if os.getenv("ENVIRONMENT"):
    settings.ENVIRONMENT = os.getenv("ENVIRONMENT")

if os.getenv("SUPABASE_URL"):
    settings.SUPABASE_URL = os.getenv("SUPABASE_URL")

if os.getenv("SUPABASE_KEY"):
    settings.SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
    settings.SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if os.getenv("SENDGRID_API_KEY"):
    settings.SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

if os.getenv("SECRET_KEY"):
    settings.SECRET_KEY = os.getenv("SECRET_KEY")

# Development overrides
if settings.ENVIRONMENT == "development":
    settings.DEBUG = True
    settings.ALLOWED_ORIGINS.append("http://localhost:3000")
    settings.ALLOWED_HOSTS.extend(["localhost", "127.0.0.1"])

# Production overrides
if settings.ENVIRONMENT == "production":
    settings.DEBUG = False
    if not settings.SECRET_KEY or settings.SECRET_KEY == "your-secret-key-change-in-production":
        raise ValueError("SECRET_KEY must be set in production")

    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise ValueError("Supabase credentials must be set in production")
