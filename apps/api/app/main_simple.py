"""
Simplified Secret Safe API - Main Application Entry Point
This is a minimal version to get the application running
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import structlog
from contextlib import asynccontextmanager

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
    logger.info("Starting Secret Safe API")
    yield
    # Shutdown
    logger.info("Shutting down Secret Safe API")

# Create FastAPI application
app = FastAPI(
    title="Secret Safe API",
    description="Privacy-first digital dead man's switch service",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error("Unhandled exception", exc_info=exc)
    return HTTPException(status_code=500, detail="Internal server error")

# Health check endpoint


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Secret Safe API"}

# Root endpoint


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Secret Safe API",
        "version": "1.0.0",
        "status": "running"
    }

# API info endpoint


@app.get("/api/info")
async def api_info():
    """API information endpoint"""
    return {
        "name": "Secret Safe API",
        "version": "1.0.0",
        "description": "Privacy-first digital dead man's switch service",
        "features": [
            "User authentication",
            "Message management",
            "Role-based access control",
            "Blockchain backup",
            "Company dissolution protection"
        ]
    }

# Test endpoint


@app.get("/api/test")
async def test_endpoint():
    """Test endpoint for development"""
    return {
        "message": "API is working!",
        "timestamp": "2024-01-01T00:00:00Z",
        "environment": "development"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

