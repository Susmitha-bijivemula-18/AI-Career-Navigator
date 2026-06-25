# backend/ingestion/remoteok_fetcher.py - RemoteOK JSON feed
import httpx
from typing import List, Dict, Any
from ingestion.base_fetcher import BaseFetcher
from core.errors import JobFetchError
from core.logging import log

class RemoteOKFetcher(BaseFetcher):
    async def fetch(self, keywords: List[str], location: str) -> List[Dict[str, Any]]:
        url = "https://remoteok.com/api"
        # RemoteOK API ignores location typically as it's for remote jobs
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=10.0)
                response.raise_for_status()
                data = response.json()
                
                raw_jobs = []
                # First item in RemoteOK API is usually legal info
                for item in data[1:]:
                    raw_jobs.append({
                        "source": "remoteok",
                        "source_job_id": str(item.get("id")),
                        "company": item.get("company", "Unknown"),
                        "role": item.get("position", ""),
                        "location": item.get("location", ""),
                        "remote": True,
                        "salary_min": item.get("salary_min"),
                        "salary_max": item.get("salary_max"),
                        "apply_url": item.get("apply_url", item.get("url", "")),
                        "posted_at": item.get("date", ""),
                        "description_raw": item.get("description", ""),
                        "tags": item.get("tags", [])
                    })
                return raw_jobs
        except Exception as e:
            log.error("remoteok_fetch_error", error=str(e))
            raise JobFetchError(f"RemoteOK fetch failed: {e}")
