# backend/ingestion/remoteok_fetcher.py - RemoteOK API fetcher
import asyncio
import httpx
from typing import List
from ingestion.base_fetcher import BaseFetcher, RawJob
from core.logging import logger

class RemoteOKFetcher(BaseFetcher):
    async def fetch(self, keywords: List[str], location: str) -> List[RawJob]:
        raw_jobs = []
        # RemoteOK blocks generic Python requests, so a browser User-Agent is required.
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
        }

        async with httpx.AsyncClient() as client:
            for kw in keywords:
                retries = 3
                for attempt in range(retries):
                    try:
                        url = f"https://remoteok.com/api?tag={kw.strip().lower()}"
                        response = await client.get(url, headers=headers, timeout=15.0)
                        
                        if response.status_code == 429:
                            wait_time = 2 ** attempt
                            logger.warning("remoteok_rate_limited", attempt=attempt, wait_seconds=wait_time, tag=kw)
                            await asyncio.sleep(wait_time)
                            continue
                            
                        response.raise_for_status()
                        items = response.json()
                        
                        if not isinstance(items, list) or len(items) <= 1:
                            break
                        
                        # Note: The first element in RemoteOK JSON response is legal/metadata text.
                        # We must bypass the first item.
                        for item in items[1:]:
                            raw_jobs.append(RawJob(
                                source_job_id=str(item.get("id", "")),
                                source_name="remoteok",
                                company=item.get("company", "Unknown Company"),
                                role=item.get("position", ""),
                                location="Remote",
                                remote=True,
                                salary_min=None,
                                salary_max=None,
                                apply_url=item.get("url", ""),
                                posted_at_raw=item.get("date", ""),
                                description_raw=item.get("description", ""),
                                tags=item.get("tags", [])
                            ))
                        break
                    except Exception as e:
                        if attempt == retries - 1:
                            logger.error("remoteok_fetch_failed_all_attempts", tag=kw, error=str(e))
                        else:
                            await asyncio.sleep(2 ** attempt)
        return raw_jobs
