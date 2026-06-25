# backend/routes/analytics.py - GET /analytics/{resume_id}
import json
from fastapi import APIRouter, Request
from cache.redis_client import redis_client
from cache.cache_keys import KEYS, TTL
from services.analytics_service import build_analytics
from services.feed_service import build_feed

router = APIRouter()

@router.get("/analytics/{resume_id}")
async def get_analytics(request: Request, resume_id: str):
    key = KEYS["analytics"](resume_id)
    cached = await redis_client.get(key)
    if cached:
        return json.loads(cached)
        
    # We need the feed to calculate analytics, in reality we'd pull from a specific collection
    feed_jobs = await build_feed(None, resume_id)
    
    doc = await build_analytics(None, resume_id, feed_jobs, ["python", "docker"]) # Mock skills
    
    await redis_client.setex(key, TTL["analytics"], json.dumps(doc))
    return doc
