# backend/ingestion/jsearch_fetcher.py - JSearch / RapidAPI client
import httpx
import asyncio
from typing import List, Dict, Any
from ingestion.base_fetcher import BaseFetcher
from core.config import settings
from core.errors import JobFetchError
from core.logging import log

class JSearchFetcher(BaseFetcher):
    async def fetch(self, keywords: List[str], location: str) -> List[Dict[str, Any]]:
        if not settings.JSEARCH_API_KEY:
            log.warning("jsearch_missing_key")
            return []
            
        url = "https://jsearch.p.rapidapi.com/search"
        query = f"{' '.join(keywords)} in {location}"
        headers = {
            "X-RapidAPI-Key": settings.JSEARCH_API_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
        }
        params = {"query": query, "page": "1", "num_pages": "1"}
        
        for attempt in range(3):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(url, headers=headers, params=params, timeout=10.0)
                    response.raise_for_status()
                    data = response.json()
                    
                    raw_jobs = []
                    for item in data.get("data", []):
                        raw_jobs.append({
                            "source": "jsearch",
                            "source_job_id": item.get("job_id", ""),
                            "company": item.get("employer_name", "Unknown"),
                            "role": item.get("job_title", ""),
                            "location": f"{item.get('job_city', '')}, {item.get('job_country', '')}",
                            "remote": item.get("job_is_remote", False),
                            "salary_min": item.get("job_min_salary"),
                            "salary_max": item.get("job_max_salary"),
                            "apply_url": item.get("job_apply_link", ""),
                            "posted_at": item.get("job_posted_at_datetime_utc", ""),
                            "description_raw": item.get("job_description", "")
                        })
                    return raw_jobs
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    wait_time = 2 ** attempt
                    await asyncio.sleep(wait_time)
                    continue
                log.error("jsearch_fetch_error", error=str(e))
                raise JobFetchError(f"JSearch HTTP error: {e}")
            except Exception as e:
                log.error("jsearch_fetch_error", error=str(e))
                raise JobFetchError(f"JSearch fetch failed: {e}")
        return []
