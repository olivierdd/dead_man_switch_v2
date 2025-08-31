"""
Admin API Routes

Handles administrative operations for the Secret Safe platform.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlmodel import Session
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from ..models.user import User
from ..models.verification import TokenType
from ..services.verification_service import VerificationService
from ..models.database import get_db
from ..routes.auth import get_current_user
from ..tasks.verification_cleanup import manual_cleanup_expired_tokens
from ..tasks.verification_cleanup import TokenCleanupService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=dict)
async def get_all_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of users to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users (admin only)."""
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Get users with pagination
        from sqlmodel import select
        stmt = select(User).offset(skip).limit(limit)
        users = db.exec(stmt).all()

        # Count total users
        total_stmt = select(User)
        total_users = len(db.exec(total_stmt).all())

        return {
            "users": [
                {
                    "id": str(user.id),
                    "email": user.email,
                    "username": user.username,
                    "role": user.role,
                    "is_verified": user.is_verified,
                    "email_verified_at": user.email_verified_at.isoformat() if user.email_verified_at else None,
                    "created_at": user.created_at.isoformat(),
                    "updated_at": user.updated_at.isoformat()
                }
                for user in users
            ],
            "total": total_users,
            "skip": skip,
            "limit": limit
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/users/{user_id}", response_model=dict)
async def get_user_details(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed user information (admin only)."""
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Get user
        from sqlmodel import select
        stmt = select(User).where(User.id == user_id)
        user = db.exec(stmt).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "role": user.role,
            "is_verified": user.is_verified,
            "email_verified_at": user.email_verified_at.isoformat() if user.email_verified_at else None,
            "created_at": user.created_at.isoformat(),
            "updated_at": user.updated_at.isoformat(),
            "last_login": user.last_login.isoformat() if user.last_login else None
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.put("/users/{user_id}/role", response_model=dict)
async def update_user_role(
    user_id: UUID,
    new_role: str = Query(..., description="New role for the user"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user role (admin only)."""
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Validate role
        valid_roles = ["admin", "writer", "reader"]
        if new_role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            )

        # Get user
        from sqlmodel import select
        stmt = select(User).where(User.id == user_id)
        user = db.exec(stmt).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Update role
        user.role = new_role
        user.updated_at = datetime.utcnow()
        db.commit()

        return {
            "success": True,
            "message": f"User role updated to {new_role}",
            "user_id": str(user_id),
            "new_role": new_role
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.delete("/users/{user_id}", response_model=dict)
async def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a user (admin only)."""
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Prevent self-deletion
        if current_user.id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )

        # Get user
        from sqlmodel import select
        stmt = select(User).where(User.id == user_id)
        user = db.exec(stmt).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Delete user
        db.delete(user)
        db.commit()

        return {
            "success": True,
            "message": "User deleted successfully",
            "user_id": str(user_id)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


# Token Cleanup Endpoints

@router.get("/cleanup/statistics", response_model=dict)
async def get_cleanup_statistics(
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get token cleanup statistics (admin only)."""
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Create cleanup service
        cleanup_service = TokenCleanupService(db)

        # Get statistics
        stats = await cleanup_service.get_cleanup_statistics(days)

        if "error" in stats:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=stats["error"]
            )

        return {
            "success": True,
            "statistics": stats
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/cleanup/expired-tokens", response_model=dict)
async def cleanup_expired_tokens_manual(
    token_types: Optional[List[str]] = Query(None, description="Specific token types to clean up"),
    batch_size: int = Query(1000, ge=100, le=5000, description="Batch size for processing"),
    dry_run: bool = Query(False, description="If True, only count tokens without deleting"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually clean up expired verification tokens (admin only)."""
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Validate token types if provided
        if token_types:
            valid_types = [t.value for t in TokenType]
            invalid_types = [t for t in token_types if t not in valid_types]
            if invalid_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid token types: {', '.join(invalid_types)}. Valid types: {', '.join(valid_types)}"
                )

        # Start background cleanup task
        task = manual_cleanup_expired_tokens.delay(
            token_types=token_types,
            batch_size=batch_size,
            dry_run=dry_run,
            user_id=str(current_user.id)
        )

        return {
            "success": True,
            "message": "Token cleanup task started",
            "task_id": task.id,
            "task_status": "PENDING",
            "dry_run": dry_run,
            "token_types": token_types or "all",
            "batch_size": batch_size
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/cleanup/task-status/{task_id}", response_model=dict)
async def get_cleanup_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get the status of a cleanup task (admin only)."""
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Import Celery app to check task status
        from ..celery_app import celery_app
        
        # Get task result
        task_result = celery_app.AsyncResult(task_id)
        
        if task_result.ready():
            if task_result.successful():
                result = task_result.result
                return {
                    "success": True,
                    "task_id": task_id,
                    "status": "COMPLETED",
                    "result": result
                }
            else:
                return {
                    "success": False,
                    "task_id": task_id,
                    "status": "FAILED",
                    "error": str(task_result.info)
                }
        else:
            return {
                "success": True,
                "task_id": task_id,
                "status": "PENDING",
                "message": "Task is still running"
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/cleanup/generate-report", response_model=dict)
async def generate_cleanup_report_manual(
    report_type: str = Query("weekly", description="Type of report to generate"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: User = Depends(get_current_user)
):
    """Manually generate a cleanup report (admin only)."""
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Validate report type
        valid_types = ["daily", "weekly", "monthly"]
        if report_type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid report type. Must be one of: {', '.join(valid_types)}"
            )

        # Start background report generation task
        from ..tasks.verification_cleanup import generate_cleanup_report
        task = generate_cleanup_report.delay()

        return {
            "success": True,
            "message": f"Cleanup report generation task started",
            "task_id": task.id,
            "task_status": "PENDING",
            "report_type": report_type
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/cleanup/scheduled-tasks", response_model=dict)
async def get_scheduled_cleanup_tasks(
    current_user: User = Depends(get_current_user)
):
    """Get information about scheduled cleanup tasks (admin only)."""
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Return scheduled task information
        scheduled_tasks = {
            "cleanup_expired_tokens": {
                "description": "Clean up expired verification tokens every hour",
                "schedule": "Every hour at minute 0",
                "queue": "verification",
                "enabled": True
            },
            "cleanup_expired_tokens_daily": {
                "description": "Comprehensive cleanup of expired tokens daily",
                "schedule": "Daily at 2 AM UTC",
                "queue": "verification",
                "enabled": True
            },
            "generate_cleanup_report": {
                "description": "Generate weekly cleanup reports",
                "schedule": "Weekly on Sunday at 3 AM UTC",
                "queue": "verification",
                "enabled": True
            }
        }

        return {
            "success": True,
            "scheduled_tasks": scheduled_tasks,
            "total_tasks": len(scheduled_tasks)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/cleanup/health-check", response_model=dict)
async def cleanup_health_check(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Perform a health check of the cleanup system (admin only)."""
    try:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        # Create cleanup service
        cleanup_service = TokenCleanupService(db)

        # Get current statistics
        stats = await cleanup_service.get_cleanup_statistics(7)  # Last 7 days

        # Check if cleanup is needed
        cleanup_needed = stats.get("cleanup_recommendation", {}).get("should_cleanup", False)
        expired_count = stats.get("expired_tokens", 0)

        # Health status
        if expired_count == 0:
            health_status = "EXCELLENT"
            message = "No expired tokens found"
        elif expired_count < 100:
            health_status = "GOOD"
            message = "Low number of expired tokens"
        elif expired_count < 1000:
            health_status = "WARNING"
            message = "Moderate number of expired tokens, cleanup recommended"
        else:
            health_status = "CRITICAL"
            message = "High number of expired tokens, immediate cleanup required"

        return {
            "success": True,
            "health_check": {
                "status": health_status,
                "message": message,
                "expired_tokens": expired_count,
                "cleanup_needed": cleanup_needed,
                "recommendation": stats.get("cleanup_recommendation", {}),
                "timestamp": datetime.utcnow().isoformat()
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
