"""
Celery Configuration for Secret Safe API

Handles background tasks, scheduled jobs, and asynchronous processing
for the Secret Safe platform.
"""

import os
from celery import Celery
from celery.schedules import crontab
from .settings import settings

# Create Celery instance
celery_app = Celery(
    "secret_safe",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.verification_cleanup",
        "app.tasks.email_tasks"
    ]
)

# Celery configuration
celery_app.conf.update(
    # Task serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,

    # Task routing
    task_routes={
        "app.tasks.verification_cleanup.*": {"queue": "verification"},
        "app.tasks.email_tasks.*": {"queue": "email"},
        "default": {"queue": "default"}
    },

    # Worker configuration
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,

    # Result backend configuration
    result_expires=3600,  # 1 hour

    # Task execution
    task_always_eager=settings.ENVIRONMENT == "testing",
    task_eager_propagates=True,

    # Beat scheduler configuration
    beat_schedule={
        # Clean up expired verification tokens every hour
        "cleanup-expired-tokens": {
            "task": "app.tasks.verification_cleanup.cleanup_expired_tokens_scheduled",
            "schedule": crontab(minute=0, hour="*"),  # Every hour at minute 0
            "options": {"queue": "verification"}
        },

        # Clean up expired tokens daily at 2 AM UTC
        "cleanup-expired-tokens-daily": {
            "task": "app.tasks.verification_cleanup.cleanup_expired_tokens_daily",
            "schedule": crontab(minute=0, hour=2),  # Daily at 2 AM UTC
            "options": {"queue": "verification"}
        },

        # Generate cleanup reports weekly on Sunday at 3 AM UTC
        "generate-cleanup-report": {
            "task": "app.tasks.verification_cleanup.generate_cleanup_report",
            # Weekly on Sunday
            "schedule": crontab(minute=0, hour=3, day_of_week=0),
            "options": {"queue": "verification"}
        }
    }
)

# Task routing


@celery_app.task(bind=True)
def debug_task(self):
    """Debug task for testing Celery configuration."""
    print(f"Request: {self.request!r}")
    return "Debug task completed successfully"


if __name__ == "__main__":
    celery_app.start()
