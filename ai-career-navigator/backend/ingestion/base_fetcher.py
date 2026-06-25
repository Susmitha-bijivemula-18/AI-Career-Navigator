# backend/ingestion/base_fetcher.py - abstract base class for all fetchers
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseFetcher(ABC):
    @abstractmethod
    async def fetch(self, keywords: List[str], location: str) -> List[Dict[str, Any]]:
        """Fetch raw jobs based on keywords and location."""
        pass
