# backend/ingestion/rss_fetcher.py - Generic RSS/Atom job feed parser
import httpx
import feedparser
from typing import List
from ingestion.base_fetcher import BaseFetcher, RawJob
from core.logging import logger

class RSSFetcher(BaseFetcher):
    def __init__(self, feed_url: str = "https://weworkremotely.com/categories/remote-programming-jobs.rss", source_name: str = "weworkremotely"):
        self.feed_url = feed_url
        self.source_name = source_name

    async def fetch(self, keywords: List[str], location: str) -> List[RawJob]:
        raw_jobs = []
        try:
            logger.info("rss_fetch_start", url=self.feed_url)
            async with httpx.AsyncClient() as client:
                response = await client.get(self.feed_url, timeout=15.0)
                response.raise_for_status()
                feed_content = response.text
                
            # feedparser.parse can accept string contents directly
            feed = feedparser.parse(feed_content)
            
            for entry in feed.entries:
                title = entry.get("title", "")
                description = entry.get("description", "") or entry.get("summary", "")
                
                # If keywords are specified, filter out jobs that don't match any keyword
                if keywords:
                    keyword_match = False
                    for kw in keywords:
                        if kw.lower() in title.lower() or kw.lower() in description.lower():
                            keyword_match = True
                            break
                    if not keyword_match:
                        continue
                
                # Custom parsing for title format "Company Name: Job Title" (e.g. on WeWorkRemotely)
                company = "Unknown Company"
                role = title
                if ":" in title:
                    parts = title.split(":", 1)
                    company = parts[0].strip()
                    role = parts[1].strip()

                raw_jobs.append(RawJob(
                    source_job_id=entry.get("id") or entry.get("link", ""),
                    source_name=self.source_name,
                    company=company,
                    role=role,
                    location="Remote",
                    remote=True,
                    apply_url=entry.get("link", ""),
                    posted_at_raw=entry.get("published") or entry.get("updated") or "",
                    description_raw=description,
                    tags=[]
                ))
            logger.info("rss_fetch_success", url=self.feed_url, count=len(raw_jobs))
        except Exception as e:
            logger.error("rss_fetch_failed", url=self.feed_url, error=str(e))
            
        return raw_jobs
