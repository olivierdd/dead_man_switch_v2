"""
Notification Routes for Secret Safe Platform

Handles all notification-related endpoints including:
- Notification management
- User preferences
- Notification history
- Mark as read functionality
"""

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from ..models.database import get_db
from ..models.notification import (
    Notification, NotificationCreate, NotificationUpdate, NotificationResponse,
    NotificationPreferences, NotificationPreferencesUpdate, NotificationStatistics,
    NotificationType, NotificationStatus
)
from ..models.user import User
from ..routes.auth import get_current_user
from ..services.notification_service import NotificationService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["notifications"])

# Initialize notification service
notification_service = NotificationService()


@router.get("/", response_model=List[NotificationResponse])
async def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    notification_type: Optional[NotificationType] = None,
    status: Optional[NotificationStatus] = None,
    unread_only: bool = Query(False)
):
    """
    Get notifications for the current user
    
    Args:
        limit: Maximum number of notifications to return (1-100)
        offset: Number of notifications to skip
        notification_type: Filter by notification type
        status: Filter by notification status
        unread_only: Return only unread notifications
        
    Returns:
        List of user notifications
    """
    try:
        if unread_only:
            status = NotificationStatus.SENT
        
        notifications = notification_service.get_user_notifications(
            user_id=current_user.id,
            limit=limit,
            offset=offset,
            notification_type=notification_type,
            status=status
        )
        
        return notifications
        
    except Exception as e:
        logger.error(f"Failed to get user notifications: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notifications"
        )


@router.get("/statistics", response_model=NotificationStatistics)
async def get_notification_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get notification statistics for the current user
    
    Returns:
        Notification statistics including counts and preferences
    """
    try:
        # Get notification statistics
        stats = notification_service.get_notification_statistics(current_user.id)
        
        # Get user preferences
        preferences = db.exec(
            select(NotificationPreferences)
            .where(NotificationPreferences.user_id == current_user.id)
        ).first()
        
        if not preferences:
            # Create default preferences if none exist
            preferences = NotificationPreferences(user_id=current_user.id)
            db.add(preferences)
            db.commit()
            db.refresh(preferences)
        
        # Create response with preferences
        response = NotificationStatistics(
            total_notifications=stats.get("total", 0),
            unread_notifications=stats.get("unread", 0),
            notifications_by_type=stats.get("by_type", {}),
            notifications_by_status=stats.get("by_status", {}),
            notifications_by_priority={},  # TODO: Implement priority statistics
            average_delivery_time=None,  # TODO: Implement delivery time tracking
            success_rate=None,  # TODO: Implement success rate calculation
            user_preferences=preferences
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Failed to get notification statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notification statistics"
        )


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """
    Mark a notification as read
    
    Args:
        notification_id: ID of the notification to mark as read
        
    Returns:
        Success message
    """
    try:
        success = notification_service.mark_notification_read(
            notification_id=notification_id,
            user_id=current_user.id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found or access denied"
            )
        
        return {"message": "Notification marked as read"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to mark notification as read: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notification as read"
        )


@router.post("/mark-all-read")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications as read for the current user
    
    Returns:
        Success message with count of notifications marked
    """
    try:
        # Get all unread notifications
        unread_notifications = db.exec(
            select(Notification).where(
                Notification.user_id == current_user.id,
                Notification.read_at.is_(None)
            )
        ).all()
        
        # Mark all as read
        from datetime import datetime, timezone
        current_time = datetime.now(timezone.utc)
        
        for notification in unread_notifications:
            notification.read_at = current_time
        
        db.commit()
        
        return {
            "message": f"Marked {len(unread_notifications)} notifications as read"
        }
        
    except Exception as e:
        logger.error(f"Failed to mark all notifications as read: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark notifications as read"
        )


@router.get("/preferences", response_model=NotificationPreferences)
async def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get notification preferences for the current user
    
    Returns:
        User's notification preferences
    """
    try:
        preferences = db.exec(
            select(NotificationPreferences)
            .where(NotificationPreferences.user_id == current_user.id)
        ).first()
        
        if not preferences:
            # Create default preferences if none exist
            preferences = NotificationPreferences(user_id=current_user.id)
            db.add(preferences)
            db.commit()
            db.refresh(preferences)
        
        return preferences
        
    except Exception as e:
        logger.error(f"Failed to get notification preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notification preferences"
        )


@router.put("/preferences", response_model=NotificationPreferences)
async def update_notification_preferences(
    preferences_update: NotificationPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update notification preferences for the current user
    
    Args:
        preferences_update: Updated preference values
        
    Returns:
        Updated notification preferences
    """
    try:
        preferences = db.exec(
            select(NotificationPreferences)
            .where(NotificationPreferences.user_id == current_user.id)
        ).first()
        
        if not preferences:
            # Create preferences if none exist
            preferences = NotificationPreferences(user_id=current_user.id)
            db.add(preferences)
        
        # Update only provided fields
        update_data = preferences_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(preferences, field):
                setattr(preferences, field, value)
        
        # Update timestamp
        from datetime import datetime, timezone
        preferences.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(preferences)
        
        return preferences
        
    except Exception as e:
        logger.error(f"Failed to update notification preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification preferences"
        )


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a notification for the current user
    
    Args:
        notification_id: ID of the notification to delete
        
    Returns:
        Success message
    """
    try:
        notification = db.exec(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == current_user.id
            )
        ).first()
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found or access denied"
            )
        
        db.delete(notification)
        db.commit()
        
        return {"message": "Notification deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete notification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete notification"
        )


@router.post("/{notification_id}/click")
async def track_notification_click(
    notification_id: UUID,
    action: Optional[str] = Query(None, description="Action taken by user"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Track when a user clicks/interacts with a notification
    
    Args:
        notification_id: ID of the notification
        action: Optional action description
        
    Returns:
        Success message
    """
    try:
        notification = db.exec(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == current_user.id
            )
        ).first()
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found or access denied"
            )
        
        # Update click tracking
        from datetime import datetime, timezone
        notification.clicked_at = datetime.now(timezone.utc)
        if action:
            notification.action_taken = action
        
        db.commit()
        
        return {"message": "Notification click tracked"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to track notification click: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to track notification click"
        )


@router.get("/types", response_model=List[str])
async def get_notification_types():
    """
    Get all available notification types
    
    Returns:
        List of notification type values
    """
    return [nt.value for nt in NotificationType]


@router.get("/statuses", response_model=List[str])
async def get_notification_statuses():
    """
    Get all available notification statuses
    
    Returns:
        List of notification status values
    """
    return [ns.value for ns in NotificationStatus]
