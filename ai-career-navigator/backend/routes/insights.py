# backend/routes/insights.py - GET /insights
import json
from fastapi import APIRouter, Request
from cache.redis_client import redis_client
from cache.cache_keys import KEYS, TTL
from services.database import supabase

router = APIRouter()

@router.get("/insights")
async def get_insights(request: Request):
    key = KEYS["insights"]()
    cached = await redis_client.get(key)
    if cached:
        return json.loads(cached)
        
    resp = supabase.table('insights').select('insight_data, created_at').order('created_at', desc=True).limit(1).execute()
    if not resp.data:
        return {}
    
    doc = resp.data[0]['insight_data']
    doc["computed_at"] = resp.data[0]['created_at']
        
    await redis_client.setex(key, TTL["insights"], json.dumps(doc))
    return doc
