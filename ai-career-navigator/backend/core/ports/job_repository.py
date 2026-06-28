from abc import ABC, abstractmethod
from typing import List, Dict, Any

class JobRepository(ABC):
    @abstractmethod
    def get_job_by_id(self, job_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_jobs(self, filters: Dict[str, Any] = None, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        pass
        
    @abstractmethod
    def search_jobs(self, query: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        pass
        
    @abstractmethod
    def insert_jobs(self, jobs: List[Dict[str, Any]]) -> None:
        pass
