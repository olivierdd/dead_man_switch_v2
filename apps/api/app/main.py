"""
Secret Safe API - Main Application
FastAPI backend with role-based access control
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager
import structlog

from .settings import settings
from .middleware.auth import AuthMiddleware
from .middleware.role_based import RoleBasedMiddleware
from .routes import auth, admin, messages, users, public, verification, notifications

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Secret Safe API", version=settings.VERSION)

    # Initialize database connections, external services, etc.
    # await init_database()
    # await init_redis()
    # await init_blockchain_services()

    yield

    # Shutdown
    logger.info("Shutting down Secret Safe API")
    # await close_database()
    # await close_redis()

# Create FastAPI application
app = FastAPI(
    title="Secret Safe API",
    description="Privacy-first digital dead man's switch service with role-based access control",
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Custom middleware
app.add_middleware(AuthMiddleware)
app.add_middleware(RoleBasedMiddleware)

# Global exception handler


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors"""
    logger.error(
        "Unhandled exception",
        path=request.url.path,
        method=request.method,
        error=str(exc),
        exc_info=True
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error_id": "internal_error"
        }
    )

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(public.router, prefix="/api/public", tags=["Public"])
app.include_router(verification.router,
                   prefix="/api/verification", tags=["Verification"])
app.include_router(notifications.router,
                   prefix="/api/notifications", tags=["Notifications"])

# Health check endpoint


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

# Root endpoint


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Secret Safe API",
        "version": settings.VERSION,
        "docs": "/docs" if settings.DEBUG else "Documentation disabled in production",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
