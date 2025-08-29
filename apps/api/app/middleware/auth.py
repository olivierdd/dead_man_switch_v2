"""
Authentication middleware for Secret Safe API
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Optional
import jwt
import structlog

from ..config import settings

logger = structlog.get_logger()


class AuthMiddleware:
    """Authentication middleware for API requests"""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive)

            # Skip auth for public endpoints
            if self._is_public_endpoint(request.url.path):
                await self.app(scope, receive, send)
                return

            # Extract and validate token
            token = self._extract_token(request)
            if not token:
                await self._send_unauthorized_response(send)
                return

            try:
                # Validate JWT token
                payload = jwt.decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=[settings.ALGORITHM]
                )

                # Add user info to request state
                scope["user"] = {
                    "id": payload.get("sub"),
                    "email": payload.get("email"),
                    "role": payload.get("role")
                }

                logger.info(
                    "User authenticated",
                    user_id=payload.get("sub"),
                    path=request.url.path
                )

            except jwt.ExpiredSignatureError:
                logger.warning("Token expired", path=request.url.path)
                await self._send_unauthorized_response(send, "Token expired")
                return

            except jwt.InvalidTokenError:
                logger.warning("Invalid token", path=request.url.path)
                await self._send_unauthorized_response(send, "Invalid token")
                return

        await self.app(scope, receive, send)

    def _is_public_endpoint(self, path: str) -> bool:
        """Check if endpoint is public (no auth required)"""
        public_paths = [
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/api/public/",
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/forgot-password"
        ]

        return any(path.startswith(public_path) for public_path in public_paths)

    def _extract_token(self, request: Request) -> Optional[str]:
        """Extract JWT token from request headers"""
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        if not auth_header.startswith("Bearer "):
            return None

        return auth_header.split(" ")[1]

    async def _send_unauthorized_response(self, send, detail: str = "Authentication required"):
        """Send unauthorized response"""
        response = JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "detail": detail,
                "error_code": "authentication_required"
            }
        )

        await send({
            "type": "http.response.start",
            "status": response.status_code,
            "headers": response.headers.raw
        })

        await send({
            "type": "http.response.body",
            "body": response.body
        })
