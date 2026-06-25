# backend/cache/redis_client.py - aioredis connection pool + helpers
import redis.asyncio as aioredis
import json
from core.config import settings
from core.errors import CacheError
from core.logging import log

class RedisClient:
    def __init__(self):
        self.redis = None

    async def connect(self):
        self.redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

    async def disconnect(self):
        if self.redis:
            await self.redis.close()

    async def get(self, key: str):
        if not self.redis:
            return None
        try:
            return await self.redis.get(key)
        except Exception as e:
            log.warning("cache_error", action="get", key=key, error=str(e))
            return None

    async def setex(self, key: str, ttl: int, value: str):
        if not self.redis:
            return
        try:
            await self.redis.setex(key, ttl, value)
        except Exception as e:
            log.warning("cache_error", action="setex", key=key, error=str(e))

    async def delete(self, key: str):
        if not self.redis:
            return
        try:
            await self.redis.delete(key)
        except Exception as e:
            log.warning("cache_error", action="delete", key=key, error=str(e))

redis_client = RedisClient()
