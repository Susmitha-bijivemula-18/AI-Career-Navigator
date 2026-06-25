# backend/routes/hiring.py - GET /hiring/{role}
import json
from fastapi import APIRouter, Request
from cache.redis_client import redis_client
from cache.cache_keys import KEYS, TTL
from services.hiring_intel import get_hiring_intel

router = APIRouter()

@router.get("/hiring/{role}")
async def get_hiring_info(request: Request, role: str):
    key = KEYS["hiring"](role)
    cached = await redis_client.get(key)
    if cached:
        return json.loads(cached)
        
    doc = await get_hiring_intel(role)
    
    await redis_client.setex(key, TTL["hiring"], json.dumps(doc))
    return doc
