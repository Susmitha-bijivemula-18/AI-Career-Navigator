# backend/ingestion/jsearch_fetcher.py - JSearch API / RapidAPI fetcher
import asyncio
import httpx
from typing import List
from ingestion.base_fetcher import BaseFetcher, RawJob
from core.config import settings
from core.logging import logger

class JSearchFetcher(BaseFetcher):
    async def fetch(self, keywords: List[str], location: str) -> List[RawJob]:
        api_key = settings.JSEARCH_API_KEY
        
        if not api_key:
            logger.warning("jsearch_fetcher_skipped", reason="Missing JSEARCH_API_KEY")
            return []

        raw_jobs = []
        headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
        }

        async with httpx.AsyncClient() as client:
            for kw in keywords:
                retries = 3
                for attempt in range(retries):
                    try:
                        url = "https://jsearch.p.rapidapi.com/search"
                        # Standard query representation
                        query = f"{kw} in {location}"
                        params = {
                            "query": query,
                            "page": "1",
                            "num_pages": "1"
                        }
                        
                        response = await client.get(url, headers=headers, params=params, timeout=10.0)
                        
                        # Handle rate limit
                        if response.status_code == 429:
                            wait_time = 2 ** attempt
                            logger.warning("jsearch_rate_limited", attempt=attempt, wait_seconds=wait_time, keyword=kw)
                            await asyncio.sleep(wait_time)
                            continue
                        
                        response.raise_for_status()
                        data = response.json()
                        
                        results = data.get("data", [])
                        for item in results:
                            raw_jobs.append(RawJob(
                                source_job_id=str(item.get("job_id", "")),
                                source_name="jsearch",
                                company=item.get("employer_name", "Unknown Company"),
                                role=item.get("job_title", ""),
                                location=item.get("job_city", location) or location,
                                remote=item.get("job_is_remote", False),
                                salary_min=item.get("job_min_salary"),
                                salary_max=item.get("job_max_salary"),
                                apply_url=item.get("job_apply_link", ""),
                                posted_at_raw=item.get("job_posted_at_datetime_utc", "") or item.get("job_posted_at_timestamp", ""),
                                description_raw=item.get("job_description", ""),
                                tags=item.get("job_required_skills", []) or []
                            ))
                        break
                    except Exception as e:
                        if attempt == retries - 1:
                            logger.error("jsearch_fetch_failed_all_attempts", keyword=kw, error=str(e))
                        else:
                            await asyncio.sleep(2 ** attempt)
        return raw_jobs
