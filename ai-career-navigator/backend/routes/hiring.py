# backend/routes/hiring.py - Router for hiring interview intelligence
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from services.hiring_intel import get_hiring_intel
from cache.redis_client import redis_client
from core.logging import logger

router = APIRouter()

@router.get("/{role}")
async def get_hiring_process(role: str):
    """
    Returns typical interview rounds and prep tips for the specified role.
    """
    # Create role slug for Redis key
    role_slug = role.lower().strip().replace(" ", "-")
    cache_key = f"hiring:{role_slug}"

    try:
        cached = await redis_client.get(cache_key)
        if cached:
            logger.info("hiring_intel_redis_hit", role=role)
            return json.loads(cached)
    except Exception as e:
        logger.warning("hiring_intel_redis_read_error", role=role, error=str(e))

    logger.info("hiring_intel_redis_miss", role=role)
    try:
        intel = await get_hiring_intel(role)
    except Exception as err:
        logger.error("hiring_intel_retrieval_failed", role=role, error=str(err))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch interview process data.")

    # Remove internal fields before serialization
    intel.pop("_id", None)
    if isinstance(intel.get("generated_at"), datetime):
        intel["generated_at"] = intel["generated_at"].isoformat() + "Z"

    try:
        # Cache in Redis for 24 hours (86400 seconds)
        await redis_client.setex(cache_key, 86400, json.dumps(intel))
    except Exception as e:
        logger.warning("hiring_intel_redis_write_error", role=role, error=str(e))

    return intel
