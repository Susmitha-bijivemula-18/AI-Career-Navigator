# backend/ingestion/base_fetcher.py - Base fetcher class definition
from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel

class RawJob(BaseModel):
    source_job_id: str
    source_name: str
    company: str
    role: str
    location: str
    remote: bool
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    apply_url: str
    posted_at_raw: str
    description_raw: str
    tags: List[str] = []

class BaseFetcher(ABC):
    @abstractmethod
    async def fetch(self, keywords: List[str], location: str) -> List[RawJob]:
        """
        Fetches jobs asynchronously matching keywords and location.
        """
        pass
