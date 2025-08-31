"""
Rate limiting middleware for Secret Safe API
"""

import hashlib
import time
from collections import defaultdict, deque
from typing import Any, Callable, Dict, Optional

import structlog
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse

from ..settings import settings

logger = structlog.get_logger(__name__)


class RateLimiter:
    """Rate limiter implementation with multiple storage backends"""

    def __init__(self):
        self.storage_backend = settings.RATE_LIMIT_STORAGE_BACKEND
        self._memory_storage: Dict[str, deque] = defaultdict(lambda: deque())
        self._ip_blacklist: Dict[str, float] = {}

    def _get_client_identifier(self, request: Request) -> str:
        """Get unique client identifier (IP address or user ID)"""
        # Try to get real IP from various headers
        real_ip = (
            request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
            or request.headers.get("X-Real-IP")
            or request.headers.get("X-Client-IP")
            or request.client.host
            if request.client
            else "unknown"
        )

        # Hash the IP for privacy and consistent storage
        return hashlib.sha256(real_ip.encode()).hexdigest()[:16]

    def _get_user_identifier(self, request: Request) -> Optional[str]:
        """Get user identifier if authenticated"""
        # This will be populated when user is authenticated
        return getattr(request.state, "user_id", None)

    def _is_ip_blacklisted(self, client_id: str) -> bool:
        """Check if IP is temporarily blacklisted"""
        if client_id in self._ip_blacklist:
            if time.time() < self._ip_blacklist[client_id]:
                return True
            else:
                # Remove expired blacklist entry
                del self._ip_blacklist[client_id]
        return False

    def _blacklist_ip(self, client_id: str, duration_seconds: int = 300):
        """Temporarily blacklist an IP address"""
        self._ip_blacklist[client_id] = time.time() + duration_seconds
        logger.warning(
            f"IP blacklisted for {duration_seconds} seconds", client_id=client_id
        )

    def _check_rate_limit(
        self, key: str, max_requests: int, window_seconds: int, request: Request
    ) -> bool:
        """Check if request is within rate limit"""
        current_time = time.time()
        client_id = self._get_client_identifier(request)

        # Check if IP is blacklisted
        if self._is_ip_blacklisted(client_id):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="IP address temporarily blocked due to excessive requests",
            )

        # Get or create rate limit window
        if key not in self._memory_storage:
            self._memory_storage[key] = deque()

        window = self._memory_storage[key]

        # Remove expired entries
        while window and window[0] < current_time - window_seconds:
            window.popleft()

        # Check if limit exceeded
        if len(window) >= max_requests:
            # Log rate limit violation
            logger.warning(
                "Rate limit exceeded",
                key=key,
                client_id=client_id,
                max_requests=max_requests,
                window_seconds=window_seconds,
            )

            # Blacklist IP if this is an authentication endpoint
            if "auth" in key.lower():
                # 10 minutes for auth violations
                self._blacklist_ip(client_id, duration_seconds=600)

            return False

        # Add current request timestamp
        window.append(current_time)
        return True

    def check_auth_rate_limit(self, request: Request, endpoint: str) -> bool:
        """Check rate limit for authentication endpoints"""
        client_id = self._get_client_identifier(request)
        key = f"auth:{endpoint}:{client_id}"

        # Different limits for different auth endpoints
        if endpoint == "login":
            max_requests = settings.AUTH_LOGIN_RATE_LIMIT_PER_MINUTE
        elif endpoint == "register":
            max_requests = settings.AUTH_REGISTER_RATE_LIMIT_PER_MINUTE
        elif endpoint == "password_reset":
            max_requests = settings.AUTH_PASSWORD_RESET_RATE_LIMIT_PER_MINUTE
        elif endpoint == "verification":
            max_requests = settings.AUTH_VERIFICATION_RATE_LIMIT_PER_MINUTE
        else:
            max_requests = settings.AUTH_LOGIN_RATE_LIMIT_PER_MINUTE  # Default

        return self._check_rate_limit(
            key=key,
            max_requests=max_requests,
            window_seconds=60,  # 1 minute window for auth
            request=request,
        )

    def check_api_rate_limit(self, request: Request, endpoint: str) -> bool:
        """Check rate limit for general API endpoints"""
        client_id = self._get_client_identifier(request)
        user_id = self._get_user_identifier(request)

        # Use user ID if authenticated, otherwise use client ID
        identifier = user_id or client_id
        key = f"api:{endpoint}:{identifier}"

        return self._check_rate_limit(
            key=key,
            max_requests=settings.API_RATE_LIMIT_PER_MINUTE,
            window_seconds=60,  # 1 minute window
            request=request,
        )

    def check_hourly_rate_limit(self, request: Request, endpoint: str) -> bool:
        """Check hourly rate limit for general API endpoints"""
        client_id = self._get_client_identifier(request)
        user_id = self._get_user_identifier(request)

        # Use user ID if authenticated, otherwise use client ID
        identifier = user_id or client_id
        key = f"hourly:{endpoint}:{identifier}"

        return self._check_rate_limit(
            key=key,
            max_requests=settings.API_RATE_LIMIT_PER_HOUR,
            window_seconds=3600,  # 1 hour window
            request=request,
        )


# Global rate limiter instance
rate_limiter = RateLimiter()


def rate_limit_auth_endpoint(endpoint: str):
    """Decorator to apply rate limiting to authentication endpoints"""

    def decorator(func: Callable) -> Callable:
        async def wrapper(*args, **kwargs):
            # Extract request from kwargs or function signature
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break

            if not request:
                # Try to get from kwargs
                request = kwargs.get("request")

            if request:
                # Check rate limit
                if not rate_limiter.check_auth_rate_limit(request, endpoint):
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Too many {endpoint} attempts. Please try again later.",
                    )

            return await func(*args, **kwargs)

        return wrapper

    return decorator


def rate_limit_api_endpoint(endpoint: str):
    """Decorator to apply rate limiting to general API endpoints"""

    def decorator(func: Callable) -> Callable:
        async def wrapper(*args, **kwargs):
            # Extract request from kwargs or function signature
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break

            if not request:
                # Try to get from kwargs
                request = kwargs.get("request")

            if request:
                # Check both minute and hourly rate limits
                if not rate_limiter.check_api_rate_limit(request, endpoint):
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Too many requests to {endpoint}. Please try again later.",
                    )

                if not rate_limiter.check_hourly_rate_limit(request, endpoint):
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Hourly rate limit exceeded for {endpoint}. Please try again later.",
                    )

            return await func(*args, **kwargs)

        return wrapper

    return decorator


async def rate_limit_middleware(request: Request, call_next):
    """FastAPI middleware for rate limiting"""
    try:
        # Add client identifier to request state
        request.state.client_id = rate_limiter._get_client_identifier(request)

        # Check rate limits based on endpoint
        path = request.url.path

        if path.startswith("/auth/"):
            # Authentication endpoints - more restrictive
            endpoint = path.split("/")[-1] if path.split("/")[-1] else "general"
            if not rate_limiter.check_auth_rate_limit(request, endpoint):
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": "Too many authentication attempts. Please try again later.",
                        "retry_after": 60,
                    },
                    headers={"Retry-After": "60"},
                )
        else:
            # General API endpoints
            endpoint = path.split("/")[-1] if path.split("/")[-1] else "general"
            if not rate_limiter.check_api_rate_limit(request, endpoint):
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": "Too many requests. Please try again later.",
                        "retry_after": 60,
                    },
                    headers={"Retry-After": "60"},
                )

        # Process request
        response = await call_next(request)
        return response

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log unexpected errors but don't block the request
        logger.error("Rate limiting middleware error", error=str(e))
        response = await call_next(request)
        return response


def get_rate_limit_info(request: Request) -> Dict[str, Any]:
    """Get rate limit information for the current client"""
    client_id = rate_limiter._get_client_identifier(request)

    # Get current usage for different endpoints
    info = {
        "client_id": client_id,
        "is_blacklisted": rate_limiter._is_ip_blacklisted(client_id),
        "limits": {
            "auth": {
                "login": settings.AUTH_LOGIN_RATE_LIMIT_PER_MINUTE,
                "register": settings.AUTH_REGISTER_RATE_LIMIT_PER_MINUTE,
                "password_reset": settings.AUTH_PASSWORD_RESET_RATE_LIMIT_PER_MINUTE,
                "verification": settings.AUTH_VERIFICATION_RATE_LIMIT_PER_MINUTE,
            },
            "api": {
                "per_minute": settings.API_RATE_LIMIT_PER_MINUTE,
                "per_hour": settings.API_RATE_LIMIT_PER_HOUR,
            },
        },
    }

    return info
