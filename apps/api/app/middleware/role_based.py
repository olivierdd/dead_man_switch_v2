"""
Role-based access control middleware for Secret Safe API
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Optional, List
import structlog

logger = structlog.get_logger()


class RoleBasedMiddleware:
    """Role-based access control middleware"""

    def __init__(self, app):
        self.app = app

        # Define role requirements for different endpoints
        self.role_requirements = {
            # Admin-only endpoints
            "/api/admin/": ["admin"],

            # Writer and Admin endpoints
            "/api/messages/": ["writer", "admin"],
            "/api/users/profile": ["writer", "admin", "reader"],
            "/api/users/check-in": ["writer", "admin"],

            # Reader endpoints (shared with higher roles)
            "/api/shared/": ["reader", "writer", "admin"],

            # Auth endpoints (no role requirement)
            "/api/auth/": [],
        }

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            request = Request(scope, receive)

            # Skip role checking for public endpoints
            if self._is_public_endpoint(request.url.path):
                await self.app(scope, receive, send)
                return

            # Get user info from auth middleware
            user = scope.get("user")
            if not user:
                await self._send_forbidden_response(send, "User not authenticated")
                return

            # Check role requirements
            required_roles = self._get_required_roles(request.url.path)
            if required_roles and user.get("role") not in required_roles:
                logger.warning(
                    "Access denied - insufficient role",
                    user_id=user.get("id"),
                    user_role=user.get("role"),
                    required_roles=required_roles,
                    path=request.url.path
                )

                await self._send_forbidden_response(
                    send,
                    f"Insufficient permissions. Required roles: {', '.join(required_roles)}"
                )
                return

            # Log successful access
            logger.info(
                "Access granted",
                user_id=user.get("id"),
                user_role=user.get("role"),
                path=request.url.path
            )

        await self.app(scope, receive, send)

    def _is_public_endpoint(self, path: str) -> bool:
        """Check if endpoint is public (no role checking)"""
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

    def _get_required_roles(self, path: str) -> List[str]:
        """Get required roles for a given endpoint path"""
        for endpoint_path, roles in self.role_requirements.items():
            if path.startswith(endpoint_path):
                return roles

        # Default: require authentication but no specific role
        return []

    async def _send_forbidden_response(self, send, detail: str = "Access denied"):
        """Send forbidden response"""
        response = JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={
                "detail": detail,
                "error_code": "insufficient_permissions"
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
