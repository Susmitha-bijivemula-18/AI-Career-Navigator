# backend/cache/redis_client.py - Redis connection pool and wrapper
import redis.asyncio as redis
from core.config import settings
from core.logging import logger

class RedisClient:
    def __init__(self):
        self.client = None

    async def connect(self):
        try:
            logger.info("redis_connecting", url=settings.REDIS_URL)
            self.client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            # Perform a ping to verify connection
            await self.client.ping()
            logger.info("redis_connected")
        except Exception as e:
            logger.warning("redis_connection_failed", error=str(e))
            self.client = None

    async def disconnect(self):
        if self.client:
            try:
                await self.client.close()
                logger.info("redis_disconnected")
            except Exception as e:
                logger.error("redis_disconnect_failed", error=str(e))
            self.client = None

    async def get(self, key: str) -> str | None:
        if not self.client:
            return None
        try:
            return await self.client.get(key)
        except Exception as e:
            logger.warning("redis_get_failed", key=key, error=str(e))
            return None  # Degraded mode: return None to fetch from DB instead of crashing

    async def setex(self, key: str, ttl: int, value: str) -> bool:
        if not self.client:
            return False
        try:
            await self.client.setex(key, ttl, value)
            return True
        except Exception as e:
            logger.warning("redis_setex_failed", key=key, error=str(e))
            return False

    async def delete(self, key: str) -> bool:
        if not self.client:
            return False
        try:
            await self.client.delete(key)
            return True
        except Exception as e:
            logger.warning("redis_delete_failed", key=key, error=str(e))
            return False

redis_client = RedisClient()
