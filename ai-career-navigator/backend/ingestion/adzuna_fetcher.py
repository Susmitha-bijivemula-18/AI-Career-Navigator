# backend/ingestion/adzuna_fetcher.py - Adzuna API fetcher
import asyncio
import httpx
from typing import List
from ingestion.base_fetcher import BaseFetcher, RawJob
from core.config import settings
from core.logging import logger

class AdzunaFetcher(BaseFetcher):
    async def fetch(self, keywords: List[str], location: str) -> List[RawJob]:
        app_id = settings.ADZUNA_APP_ID
        app_key = settings.ADZUNA_API_KEY
        
        if not app_id or not app_key:
            logger.warning("adzuna_fetcher_skipped", reason="Missing API credentials")
            return []

        country = "us"  # Defaulting to US market
        raw_jobs = []

        async with httpx.AsyncClient() as client:
            for kw in keywords:
                retries = 3
                for attempt in range(retries):
                    try:
                        url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
                        params = {
                            "app_id": app_id,
                            "app_key": app_key,
                            "what": kw,
                            "where": location,
                            "content-type": "application/json"
                        }
                        
                        response = await client.get(url, params=params, timeout=10.0)
                        
                        # Handle rate limiting (HTTP 429)
                        if response.status_code == 429:
                            wait_time = 2 ** attempt
                            logger.warning("adzuna_rate_limited", attempt=attempt, wait_seconds=wait_time, keyword=kw)
                            await asyncio.sleep(wait_time)
                            continue
                        
                        response.raise_for_status()
                        data = response.json()
                        
                        results = data.get("results", [])
                        for item in results:
                            raw_jobs.append(RawJob(
                                source_job_id=str(item.get("id", "")),
                                source_name="adzuna",
                                company=item.get("company", {}).get("display_name", "Unknown Company"),
                                role=item.get("title", ""),
                                location=item.get("location", {}).get("display_name", location),
                                remote="remote" in item.get("title", "").lower() or "remote" in item.get("description", "").lower(),
                                salary_min=item.get("salary_min"),
                                salary_max=item.get("salary_max"),
                                apply_url=item.get("redirect_url", ""),
                                posted_at_raw=item.get("created", ""),
                                description_raw=item.get("description", ""),
                                tags=[item.get("category", {}).get("label", "")] if item.get("category", {}).get("label") else []
                            ))
                        # Fetch succeeded for this keyword, proceed to next keyword
                        break
                    except Exception as e:
                        if attempt == retries - 1:
                            logger.error("adzuna_fetch_failed_all_attempts", keyword=kw, error=str(e))
                        else:
                            await asyncio.sleep(2 ** attempt)
        return raw_jobs
