# backend/routes/insights.py - Router for market demand insights
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from services.database import db
from db.collections import INSIGHTS_COLLECTION
from cache.redis_client import redis_client
from core.logging import logger

router = APIRouter()

@router.get("")
@router.get("/")
async def get_insights():
    """
    Returns the latest compiled statistics including trending skills, role demand, and salaries.
    """
    cache_key = "insights:latest"
    try:
        cached = await redis_client.get(cache_key)
        if cached:
            logger.info("insights_cache_hit")
            return json.loads(cached)
    except Exception as e:
        logger.warning("insights_cache_read_error", error=str(e))

    logger.info("insights_cache_miss")
    # Query database for most recent calculation
    doc = await db[INSIGHTS_COLLECTION].find_one(sort=[("computed_at", -1)])
    if not doc:
        # Fallback to trigger calculations immediately if collection is empty
        logger.warning("insights_empty_triggering_computation")
        from services.insight_engine import compute_insights
        try:
            doc = await compute_insights(db)
        except Exception as err:
            logger.error("insights_computation_fallback_failed", error=str(err))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Marketplace insights temporarily unavailable.")

    # Sanitise output
    doc.pop("_id", None)
    if isinstance(doc.get("computed_at"), datetime):
        doc["computed_at"] = doc["computed_at"].isoformat() + "Z"

    try:
        # Cache results for 1 hour
        await redis_client.setex(cache_key, 3600, json.dumps(doc))
    except Exception as e:
        logger.warning("insights_cache_write_error", error=str(e))

    return doc
