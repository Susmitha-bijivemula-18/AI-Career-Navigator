# backend/workers/scheduler.py - APScheduler setup + job registration
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from workers import fetch_worker, insight_worker, expiry_worker

scheduler = AsyncIOScheduler()

# Fetch new jobs every X minutes
def setup_scheduler(fetch_interval_minutes: int):
    scheduler.add_job(
        fetch_worker.run, 
        "interval", 
        minutes=fetch_interval_minutes, 
        id="fetch_jobs"
    )

    # Recompute insights every 6 hours
    scheduler.add_job(
        insight_worker.run, 
        "interval", 
        hours=6,
        id="compute_insights"
    )

    # Expire stale jobs daily at 02:00 UTC
    scheduler.add_job(
        expiry_worker.run, 
        "cron", 
        hour=2,
        id="expire_jobs"
    )

def start_scheduler():
    setup_scheduler(30)
    scheduler.start()

def shutdown_scheduler():
    scheduler.shutdown()
