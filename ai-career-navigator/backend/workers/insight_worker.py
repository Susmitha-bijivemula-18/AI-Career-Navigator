# backend/workers/insight_worker.py - computes trending skills every 6 h
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
from core.logging import log
from services.insight_engine import compute_insights

async def run():
    log.info("insight_worker_started")
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        db = client[settings.DB_NAME]
        await compute_insights(db)
        log.info("insight_worker_finished")
    except Exception as e:
        log.error("insight_worker_failed", error=str(e))
