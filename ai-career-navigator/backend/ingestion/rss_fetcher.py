# backend/ingestion/rss_fetcher.py - generic RSS/Atom parser
import feedparser
from typing import List, Dict, Any
from ingestion.base_fetcher import BaseFetcher
from core.errors import JobFetchError
from core.logging import log

class RSSFetcher(BaseFetcher):
    def __init__(self, feed_url: str, source_name: str):
        self.feed_url = feed_url
        self.source_name = source_name

    async def fetch(self, keywords: List[str], location: str) -> List[Dict[str, Any]]:
        # feedparser is synchronous but usually fast enough; could run in executor if needed
        try:
            feed = feedparser.parse(self.feed_url)
            raw_jobs = []
            for entry in feed.entries:
                raw_jobs.append({
                    "source": self.source_name,
                    "source_job_id": entry.get("id", entry.get("link", "")),
                    "company": "Unknown", # Often missing in standard RSS
                    "role": entry.get("title", ""),
                    "location": "",
                    "remote": False,
                    "apply_url": entry.get("link", ""),
                    "posted_at": entry.get("published", ""),
                    "description_raw": entry.get("description", "")
                })
            return raw_jobs
        except Exception as e:
            log.error("rss_fetch_error", source=self.source_name, error=str(e))
            raise JobFetchError(f"RSS fetch failed for {self.source_name}: {e}")
