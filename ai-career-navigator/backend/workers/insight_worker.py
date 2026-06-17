# backend/workers/insight_worker.py - Triggers insights computations
from services.insight_engine import compute_insights
from services.database import db
from core.logging import logger

async def run():
    """
    Computes trending skills and role demand stats and stores them in the DB.
    """
    logger.info("insight_worker_started")
    try:
        doc = await compute_insights(db)
        logger.info("insight_worker_success", computed_at=doc.get("computed_at"))
    except Exception as e:
        logger.error("insight_worker_failed", error=str(e))
