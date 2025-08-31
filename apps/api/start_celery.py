#!/usr/bin/env python3
"""
Celery Startup Script for Secret Safe API

This script starts Celery workers and the beat scheduler for background tasks.
"""

from app.celery_app import celery_app
from celery import Celery
import os
import sys
import argparse
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))


def start_worker(concurrency=2, queue="default"):
    """Start a Celery worker."""
    print(
        f"Starting Celery worker with concurrency={concurrency}, queue={queue}")

    # Start worker
    celery_app.worker_main([
        "worker",
        "--loglevel=info",
        f"--concurrency={concurrency}",
        f"--queues={queue}",
        "--hostname=worker@%h"
    ])


def start_beat():
    """Start the Celery beat scheduler."""
    print("Starting Celery beat scheduler")

    # Start beat scheduler
    celery_app.worker_main([
        "beat",
        "--loglevel=info",
        "--scheduler=celery.beat.PersistentScheduler"
    ])


def start_flower():
    """Start Flower monitoring interface."""
    print("Starting Flower monitoring interface")

    # Start Flower
    celery_app.worker_main([
        "flower",
        "--port=5555",
        "--broker=redis://localhost:6379/0",
        "--broker_api=redis://localhost:6379/0"
    ])


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Start Celery services for Secret Safe API")
    parser.add_argument(
        "service",
        choices=["worker", "beat", "flower", "all"],
        help="Service to start"
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=2,
        help="Number of worker processes (default: 2)"
    )
    parser.add_argument(
        "--queue",
        default="default",
        help="Queue to process (default: default)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=5555,
        help="Port for Flower monitoring (default: 5555)"
    )

    args = parser.parse_args()

    try:
        if args.service == "worker":
            start_worker(args.concurrency, args.queue)
        elif args.service == "beat":
            start_beat()
        elif args.service == "flower":
            start_flower()
        elif args.service == "all":
            print("Starting all Celery services...")
            print("Note: You may want to run these in separate terminals:")
            print(f"  Terminal 1: {sys.argv[0]} beat")
            print(
                f"  Terminal 2: {sys.argv[0]} worker --concurrency={args.concurrency}")
            print(f"  Terminal 3: {sys.argv[0]} flower --port={args.port}")

            # Start beat in current process
            start_beat()
        else:
            print(f"Unknown service: {args.service}")
            sys.exit(1)

    except KeyboardInterrupt:
        print("\nShutting down Celery services...")
        sys.exit(0)
    except Exception as e:
        print(f"Error starting Celery service: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
