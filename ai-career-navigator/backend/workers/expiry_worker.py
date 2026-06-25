# backend/workers/expiry_worker.py - marks stale jobs (>30 days) inactive
from datetime import datetime, timedelta
from core.config import settings
from core.logging import log
from services.database import supabase

async def run():
    log.info("expiry_worker_started")
    try:
        # In addition to MongoDB TTL, optionally mark as inactive explicitly
        threshold = datetime.utcnow() - timedelta(days=settings.JOB_EXPIRY_DAYS)
        threshold_iso = threshold.isoformat()
        response = supabase.table('jobs').update({"is_active": False}).lt("posted_at", threshold_iso).eq("is_active", True).execute()
        expired_count = len(response.data) if response.data else 0
        log.info("expiry_worker_finished", expired_count=expired_count)
    except Exception as e:
        log.error("expiry_worker_failed", error=str(e))
