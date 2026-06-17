# backend/workers/expiry_worker.py - Deactivates expired jobs
from datetime import datetime
from services.database import db
from db.collections import JOBS_COLLECTION
from core.logging import logger

async def run():
    """
    Finds and marks jobs older than 30 days as inactive.
    """
    logger.info("expiry_worker_started")
    try:
        now = datetime.utcnow()
        # Mark all active jobs whose expires_at is in the past as inactive
        result = await db[JOBS_COLLECTION].update_many(
            {"expires_at": {"$lt": now}, "is_active": True},
            {"$set": {"is_active": False}}
        )
        logger.info("expiry_worker_success", deactivated_count=result.modified_count)
    except Exception as e:
        logger.error("expiry_worker_failed", error=str(e))
