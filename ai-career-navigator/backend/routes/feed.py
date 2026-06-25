# backend/routes/feed.py - GET /feed
import json
from fastapi import APIRouter, Request, Query
from cache.redis_client import redis_client
from cache.cache_keys import KEYS, TTL
from services.feed_service import build_feed

router = APIRouter()

@router.get("/feed")
async def get_feed(request: Request, resume_id: str, limit: int = 20, offset: int = 0):
    key = KEYS["feed"](resume_id)
    cached = await redis_client.get(key)
    
    if cached:
        all_jobs = json.loads(cached)
    else:
        all_jobs = await build_feed(None, resume_id)
        await redis_client.setex(key, TTL["feed"], json.dumps(all_jobs))
        
    page_jobs = all_jobs[offset : offset + limit]
    
    return {
        "jobs": page_jobs,
        "total": len(all_jobs),
        "page": (offset // limit) + 1 if limit > 0 else 1
    }
