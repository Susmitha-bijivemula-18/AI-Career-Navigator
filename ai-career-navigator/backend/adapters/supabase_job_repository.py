from core.ports.job_repository import JobRepository
from services.database import supabase
from typing import List, Dict, Any

class SupabaseJobRepository(JobRepository):
    def get_job_by_id(self, job_id: str) -> Dict[str, Any]:
        result = supabase.table("jobs").select("*").eq("id", job_id).execute()
        return result.data[0] if result.data else None

    def get_jobs(self, filters: Dict[str, Any] = None, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        query = supabase.table("jobs").select("*")
        
        if filters:
            if "location" in filters and filters["location"]:
                query = query.ilike("location", f"%{filters['location']}%")
            if "experience_level" in filters and filters["experience_level"]:
                query = query.eq("experience_level", filters["experience_level"])
            if "employment_type" in filters and filters["employment_type"]:
                query = query.eq("employment_type", filters["employment_type"])
                
        query = query.order("posted_at", desc=True).limit(limit).offset(offset)
        result = query.execute()
        return result.data

    def search_jobs(self, search_query: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        # Using Supabase ilike on multiple columns
        result = supabase.table("jobs").select("*").or_(f"role.ilike.%{search_query}%,company_name.ilike.%{search_query}%").order("posted_at", desc=True).limit(limit).offset(offset).execute()
        return result.data
        
    def insert_jobs(self, jobs: List[Dict[str, Any]]) -> None:
        supabase.table("jobs").insert(jobs).execute()
