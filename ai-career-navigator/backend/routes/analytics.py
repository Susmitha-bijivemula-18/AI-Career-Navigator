# backend/routes/analytics.py - Router for resume analytics visualization data
import json
from fastapi import APIRouter, HTTPException, status
from services.analytics_service import generate_analytics
from cache.redis_client import redis_client
from core.logging import logger

router = APIRouter()

@router.get("/{resume_id}")
async def get_analytics(resume_id: str):
    """
    Returns skill overlap distribution and match score breakdown for rendering charts.
    """
    cache_key = f"analytics:{resume_id}"
    
    try:
        cached = await redis_client.get(cache_key)
        if cached:
            logger.info("analytics_redis_hit", resume_id=resume_id)
            return json.loads(cached)
    except Exception as e:
        logger.warning("analytics_redis_read_error", resume_id=resume_id, error=str(e))

    logger.info("analytics_redis_miss", resume_id=resume_id)
    try:
        result = await generate_analytics(resume_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        logger.error("analytics_processing_failed", resume_id=resume_id, error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to compile resume metrics.")

    try:
        # Cache in Redis for 30 minutes (1800 seconds)
        await redis_client.setex(cache_key, 1800, json.dumps(result))
    except Exception as e:
        logger.warning("analytics_redis_write_error", resume_id=resume_id, error=str(e))

    return result
