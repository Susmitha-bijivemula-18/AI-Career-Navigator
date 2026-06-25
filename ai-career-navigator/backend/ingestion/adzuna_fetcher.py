# backend/ingestion/adzuna_fetcher.py - Adzuna API client
import httpx
import asyncio
from typing import List, Dict, Any
from ingestion.base_fetcher import BaseFetcher
from core.config import settings
from core.errors import JobFetchError
from core.logging import log

class AdzunaFetcher(BaseFetcher):
    async def fetch(self, keywords: List[str], location: str) -> List[Dict[str, Any]]:
        if not settings.ADZUNA_APP_ID or not settings.ADZUNA_API_KEY:
            log.warning("adzuna_missing_keys")
            return []
            
        url = f"https://api.adzuna.com/v1/api/jobs/gb/search/1"
        params = {
            "app_id": settings.ADZUNA_APP_ID,
            "app_key": settings.ADZUNA_API_KEY,
            "results_per_page": 50,
            "what": " ".join(keywords),
            "where": location
        }
        
        for attempt in range(3):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(url, params=params, timeout=10.0)
                    response.raise_for_status()
                    data = response.json()
                    
                    raw_jobs = []
                    for item in data.get("results", []):
                        raw_jobs.append({
                            "source": "adzuna",
                            "source_job_id": str(item.get("id")),
                            "company": item.get("company", {}).get("display_name", "Unknown"),
                            "role": item.get("title", ""),
                            "location": item.get("location", {}).get("display_name", ""),
                            "remote": "remote" in item.get("title", "").lower() or "remote" in item.get("description", "").lower(),
                            "salary_min": item.get("salary_min"),
                            "salary_max": item.get("salary_max"),
                            "apply_url": item.get("redirect_url", ""),
                            "posted_at": item.get("created", ""),
                            "description_raw": item.get("description", "")
                        })
                    return raw_jobs
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    wait_time = 2 ** attempt
                    log.warning("adzuna_rate_limit", attempt=attempt, wait=wait_time)
                    await asyncio.sleep(wait_time)
                    continue
                log.error("adzuna_fetch_error", error=str(e))
                raise JobFetchError(f"Adzuna HTTP error: {e}")
            except Exception as e:
                log.error("adzuna_fetch_error", error=str(e))
                raise JobFetchError(f"Adzuna fetch failed: {e}")
                
        return []
