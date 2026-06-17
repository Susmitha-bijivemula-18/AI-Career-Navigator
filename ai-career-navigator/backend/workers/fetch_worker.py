# backend/workers/fetch_worker.py - Job fetching and ingestion orchestrator
import time
from typing import List
from services.database import db
from db.collections import JOBS_COLLECTION
from ingestion.adzuna_fetcher import AdzunaFetcher
from ingestion.jsearch_fetcher import JSearchFetcher
from ingestion.remoteok_fetcher import RemoteOKFetcher
from ingestion.rss_fetcher import RSSFetcher
from ingestion.normaliser import normalise_job
from core.logging import logger

# Central keywords list for matching jobs
KEYWORDS = ["python", "javascript", "react", "django", "fastapi", "rust", "go", "devops"]
LOCATION = "United States"

async def run():
    """
    Main entry point for the fetch worker. Runs all fetchers, normalizing and saving jobs.
    """
    logger.info("fetch_worker_started")
    fetchers = [
        AdzunaFetcher(),
        JSearchFetcher(),
        RemoteOKFetcher(),
        RSSFetcher()
    ]
    
    jobs_collection = db[JOBS_COLLECTION]
    total_ingested = 0

    for fetcher in fetchers:
        source_name = fetcher.__class__.__name__.replace("Fetcher", "").lower()
        try:
            start_time = time.time()
            logger.info("fetcher_run_start", source=source_name)
            
            # Fetch jobs using primary keywords
            raw_jobs = await fetcher.fetch(KEYWORDS[:4], LOCATION)
            
            duration_ms = int((time.time() - start_time) * 1000)
            logger.info("fetcher_run_complete", source=source_name, count=len(raw_jobs), duration_ms=duration_ms)
            
            source_ingested = 0
            for raw_job in raw_jobs:
                try:
                    doc = normalise_job(raw_job)
                    doc_dict = doc.model_dump()
                    
                    # Separate properties for insert-only vs update-always
                    # ONLY update fetched_at on existing records, not posted_at
                    set_fields = {
                        "is_active": doc_dict["is_active"],
                        "fetched_at": doc_dict["fetched_at"],
                        "expires_at": doc_dict["expires_at"],
                        "description_raw": doc_dict["description_raw"],
                        "tags": doc_dict["tags"],
                        "apply_url": doc_dict["apply_url"],
                        "salary_min": doc_dict["salary_min"],
                        "salary_max": doc_dict["salary_max"],
                        "required_skills": doc_dict["required_skills"],
                        "role": doc_dict["role"],
                        "location": doc_dict["location"],
                        "remote": doc_dict["remote"],
                        "experience_level": doc_dict["experience_level"]
                    }
                    
                    set_on_insert = {
                        "external_id": doc_dict["external_id"],
                        "source": doc_dict["source"],
                        "company": doc_dict["company"],
                        "posted_at": doc_dict["posted_at"]
                    }
                    
                    await jobs_collection.update_one(
                        {"external_id": doc.external_id},
                        {
                            "$set": set_fields,
                            "$setOnInsert": set_on_insert
                        },
                        upsert=True
                    )
                    source_ingested += 1
                except Exception as ex:
                    logger.error("job_upsert_failed", source=source_name, error=str(ex))
                    
            total_ingested += source_ingested
            logger.info("fetcher_ingest_summary", source=source_name, ingested=source_ingested)
        except Exception as e:
            # Let one failed source NEVER crash the entire scheduler job
            logger.error("fetcher_run_failed", source=source_name, error=str(e))

    logger.info("fetch_worker_finished", total_ingested=total_ingested)
