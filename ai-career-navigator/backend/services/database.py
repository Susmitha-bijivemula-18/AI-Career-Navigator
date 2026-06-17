# backend/services/database.py - MongoDB Connection using Motor
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DB_NAME]

# Collections
resumes_collection = db["resumes"]
gap_cache_collection = db["gap_cache"]
