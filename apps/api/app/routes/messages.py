"""
Message routes for Secret Safe API
Message creation, management, and sharing functionality
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from datetime import datetime

from ..models import (
    MessageCreate, MessageUpdate, MessageResponse,
    MessageShareCreate, MessageCheckIn, get_user_model
)
from ..routes.auth import get_current_user

router = APIRouter()

# Role requirement decorator for Writers and Admins


def require_writer_or_admin(current_user=Depends(get_current_user)):
    """Ensure user has writer or admin role"""
    if current_user.role not in ["writer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Writer or Admin access required"
        )
    return current_user


@router.post("/", response_model=MessageResponse)
async def create_message(
    message_data: MessageCreate,
    current_user=Depends(require_writer_or_admin)
):
    """Create a new message (Writer/Admin only)"""
    # TODO: Implement message creation
    # - Encrypt content
    # - Create message in database
    # - Create recipients
    # - Schedule check-ins

    return MessageResponse(
        id="new-message-id",
        title=message_data.title,
        description=message_data.description,
        status="draft",
        check_in_interval=message_data.check_in_interval,
        grace_period=message_data.grace_period,
        last_check_in=None,
        next_check_in_deadline=None,
        created_at=datetime.utcnow(),
        activated_at=None,
        expires_at=None,
        is_shared=False,
        recipient_count=len(message_data.recipients)
    )


@router.get("/", response_model=List[MessageResponse])
async def list_user_messages(
    current_user=Depends(require_writer_or_admin),
    status_filter: str = None,
    limit: int = 50,
    offset: int = 0
):
    """List user's messages (Writer/Admin only)"""
    # TODO: Implement message listing
    # - Get user's messages from database
    # - Apply filters and pagination
    # - Return message summaries

    return []


@router.get("/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: str,
    current_user=Depends(require_writer_or_admin)
):
    """Get message details (Writer/Admin only)"""
    # TODO: Implement message retrieval
    # - Verify user owns message or is admin
    # - Return message details (no encrypted content)

    return MessageResponse(
        id=message_id,
        title="Test Message",
        description="Test description",
        status="active",
        check_in_interval=7,
        grace_period=3,
        last_check_in=datetime.utcnow(),
        next_check_in_deadline=datetime.utcnow(),
        created_at=datetime.utcnow(),
        activated_at=datetime.utcnow(),
        expires_at=None,
        is_shared=False,
        recipient_count=0
    )


@router.put("/{message_id}", response_model=MessageResponse)
async def update_message(
    message_id: str,
    message_update: MessageUpdate,
    current_user=Depends(require_writer_or_admin)
):
    """Update message (Writer/Admin only)"""
    # TODO: Implement message update
    # - Verify user owns message or is admin
    # - Update message fields
    # - Handle content re-encryption if needed

    return MessageResponse(
        id=message_id,
        title=message_update.title or "Updated Message",
        description=message_update.description,
        status="active",
        check_in_interval=message_update.check_in_interval or 7,
        grace_period=message_update.grace_period or 3,
        last_check_in=datetime.utcnow(),
        next_check_in_deadline=datetime.utcnow(),
        created_at=datetime.utcnow(),
        activated_at=datetime.utcnow(),
        expires_at=None,
        is_shared=False,
        recipient_count=2
    )


@router.delete("/{message_id}")
async def delete_message(
    message_id: str,
    current_user=Depends(require_writer_or_admin)
):
    """Delete message (Writer/Admin only)"""
    # TODO: Implement message deletion
    # - Verify user owns message or is admin
    # - Soft delete or mark as cancelled
    # - Handle active recipients

    return {"message": "Message deleted successfully"}


@router.post("/{message_id}/share")
async def share_message(
    message_id: str,
    share_data: MessageShareCreate,
    current_user=Depends(require_writer_or_admin)
):
    """Share message with Reader user (Writer/Admin only)"""
    # TODO: Implement message sharing
    # - Verify user owns message or is admin
    # - Create share record
    # - Notify Reader user

    return {
        "message": "Message shared successfully",
        "message_id": message_id,
        "shared_with": share_data.reader_email,
        "access_level": share_data.access_level
    }


@router.post("/{message_id}/check-in")
async def check_in_message(
    message_id: str,
    check_in_data: MessageCheckIn,
    current_user=Depends(require_writer_or_admin)
):
    """Perform message check-in (Writer/Admin only)"""
    # TODO: Implement message check-in
    # - Verify user owns message or is admin
    # - Update last check-in time
    # - Extend next deadline
    # - Log check-in activity

    return {
        "message": "Check-in successful",
        "message_id": message_id,
        "checked_in_at": datetime.utcnow(),
        "next_deadline": datetime.utcnow()
    }


@router.post("/{message_id}/activate")
async def activate_message(
    message_id: str,
    current_user=Depends(require_writer_or_admin)
):
    """Activate message (Writer/Admin only)"""
    # TODO: Implement message activation
    # - Verify user owns message or is admin
    # - Set status to active
    # - Start check-in monitoring
    # - Notify recipients

    return {
        "message": "Message activated successfully",
        "message_id": message_id,
        "activated_at": datetime.utcnow()
    }
