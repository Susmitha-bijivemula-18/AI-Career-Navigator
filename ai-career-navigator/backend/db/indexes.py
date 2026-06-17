# backend/db/indexes.py - Setup MongoDB indexes on startup
import pymongo
from services.database import db
from db.collections import JOBS_COLLECTION, HIRING_INTEL_COLLECTION
from core.logging import logger

async def init_db_indexes():
    """
    Creates indexes for MongoDB collections. Runs on application startup.
    """
    try:
        logger.info("db_indexes_init_start")
        
        # --- JOBS INDEXES ---
        jobs = db[JOBS_COLLECTION]
        
        # 1. Unique index on external_id for deduplication
        await jobs.create_index(
            [("external_id", pymongo.ASCENDING)], 
            unique=True,
            name="idx_jobs_external_id_unique"
        )
        
        # 2. Index on posted_at desc for fresh sorting
        await jobs.create_index(
            [("posted_at", pymongo.DESCENDING)],
            name="idx_jobs_posted_at"
        )
        
        # 3. Compound index for active feed queries
        await jobs.create_index(
            [("is_active", pymongo.ASCENDING), ("posted_at", pymongo.DESCENDING)],
            name="idx_jobs_active_feed"
        )
        
        # 4. Index on required_skills for filtering
        await jobs.create_index(
            [("required_skills", pymongo.ASCENDING)],
            name="idx_jobs_required_skills"
        )
        
        # 5. TTL index on expires_at (auto-deleted by MongoDB)
        await jobs.create_index(
            [("expires_at", pymongo.ASCENDING)],
            expireAfterSeconds=0,
            name="idx_jobs_expires_ttl"
        )
        
        # --- HIRING INTEL INDEXES ---
        hiring_intel = db[HIRING_INTEL_COLLECTION]
        
        # 1. Unique index on role slug/title
        await hiring_intel.create_index(
            [("role", pymongo.ASCENDING)],
            unique=True,
            name="idx_hiring_intel_role_unique"
        )
        
        logger.info("db_indexes_init_complete")
    except Exception as e:
        logger.error("db_indexes_init_failed", error=str(e))
        raise e
