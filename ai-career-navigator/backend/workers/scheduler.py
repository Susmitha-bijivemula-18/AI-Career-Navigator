# backend/workers/scheduler.py - Background task scheduler using APScheduler
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from workers import fetch_worker, insight_worker, expiry_worker
from core.config import settings
from core.logging import logger

# Initialize AsyncIOScheduler
scheduler = AsyncIOScheduler()

# Register jobs
scheduler.add_job(
    fetch_worker.run, 
    "interval", 
    minutes=settings.FETCH_INTERVAL_MINUTES, 
    id="fetch_jobs"
)

scheduler.add_job(
    insight_worker.run, 
    "interval", 
    hours=6, 
    id="compute_insights"
)

scheduler.add_job(
    expiry_worker.run, 
    "cron", 
    hour=2, 
    id="expire_jobs"
)

def start_scheduler():
    """Starts the background scheduler."""
    if not scheduler.running:
        logger.info("scheduler_starting")
        scheduler.start()
        logger.info("scheduler_started")

def shutdown_scheduler():
    """Shuts down the background scheduler."""
    if scheduler.running:
        logger.info("scheduler_stopping")
        scheduler.shutdown()
        logger.info("scheduler_stopped")
