# backend/workers/fetch_worker.py - runs all fetchers, deduplicates, saves
import asyncio
from core.config import settings
from core.logging import log
from services.database import supabase
from ingestion.adzuna_fetcher import AdzunaFetcher
from ingestion.jsearch_fetcher import JSearchFetcher
from ingestion.remoteok_fetcher import RemoteOKFetcher
from ingestion.rss_fetcher import RSSFetcher
from ingestion.normaliser import normalise_job

async def run():
    log.info("fetch_worker_started")
    keywords = ["software engineer", "developer", "backend"]
    location = "UK" # Default for MVP
    
    fetchers = [
        AdzunaFetcher(),
        JSearchFetcher(),
        RemoteOKFetcher(),
        RSSFetcher("https://weworkremotely.com/categories/remote-programming-jobs.rss", "weworkremotely")
    ]
    
    for fetcher in fetchers:
        try:
            raw_jobs = await fetcher.fetch(keywords, location)
            for raw_job in raw_jobs:
                job_doc = normalise_job(raw_job)
                # Supabase uses datetime strings or handles them if passed as strings.
                # normalise_job should produce ISO strings for datetime fields.
                # We do an upsert on external_id
                job_doc["is_active"] = True
                supabase.table('jobs').upsert(
                    job_doc, 
                    on_conflict="external_id"
                ).execute()
            log.info("fetch_worker_source_complete", source=fetcher.__class__.__name__, count=len(raw_jobs))
        except Exception as e:
            log.error("fetch_worker_source_failed", source=fetcher.__class__.__name__, error=str(e))
            
    log.info("fetch_worker_finished")
