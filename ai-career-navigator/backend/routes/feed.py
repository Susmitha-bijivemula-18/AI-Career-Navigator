# backend/routes/feed.py - Router for candidate job feed
import json
from fastapi import APIRouter, Query, HTTPException, status
from services import feed_service
from cache.redis_client import redis_client
from cache.cache_keys import TTL
from core.logging import logger

router = APIRouter()

@router.get("")
@router.get("/")
async def get_feed(
    resume_id: str = Query(..., description="ID of the resume to match"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Returns ranked, fresh, and deduplicated jobs matching the user resume.
    """
    # Key incorporates pagination boundaries to prevent invalid offset cache hits
    cache_key = f"feed:{resume_id}:{limit}:{offset}"
    
    try:
        cached = await redis_client.get(cache_key)
        if cached:
            logger.info("feed_cache_hit", resume_id=resume_id, limit=limit, offset=offset)
            return json.loads(cached)
    except Exception as e:
        # Fallback to DB (degraded mode)
        logger.warning("feed_cache_read_error", resume_id=resume_id, error=str(e))

    logger.info("feed_cache_miss", resume_id=resume_id, limit=limit, offset=offset)
    try:
        result = await feed_service.build_feed(resume_id, limit, offset)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        logger.error("feed_generation_failed", resume_id=resume_id, error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to compile job feed.")

    try:
        # Save to cache
        await redis_client.setex(cache_key, TTL["feed"], json.dumps(result))
    except Exception as e:
        logger.warning("feed_cache_write_error", resume_id=resume_id, error=str(e))

    return result
