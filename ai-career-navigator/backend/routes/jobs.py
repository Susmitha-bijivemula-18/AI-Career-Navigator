import os
from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
from adapters.supabase_job_repository import SupabaseJobRepository
from core.logging import log
from services.job_matcher import match_jobs

router = APIRouter()
repo = SupabaseJobRepository()

@router.get("/")
def get_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    role: Optional[str] = None,
    location: Optional[str] = None,
    experience_level: Optional[str] = None,
    employment_type: Optional[str] = None
):
    """
    Returns jobs fetched from Supabase using JobRepository.
    """
    try:
        filters = {}
        if role: filters["role"] = role
        if location: filters["location"] = location
        if experience_level: filters["experience_level"] = experience_level
        if employment_type: filters["employment_type"] = employment_type
        
        jobs = repo.get_jobs(filters=filters, limit=limit, offset=skip)
        return jobs
    except Exception as e:
        log.error("fetch_jobs_error", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch jobs from database.")

@router.get("/{job_id}")
def get_job(job_id: str):
    """
    Returns a single job by ID.
    """
    try:
        job = repo.get_job_by_id(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except HTTPException:
        raise
    except Exception as e:
        log.error("fetch_job_error", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch job.")

@router.get("/search")
def search_jobs(
    q: str = Query(..., min_length=2),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Full-text search on role and company_name.
    """
    try:
        jobs = repo.search_jobs(query=q, limit=limit, offset=skip)
        return jobs
    except Exception as e:
        log.error("search_jobs_error", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to search jobs.")

@router.post("/recommendations")
def recommend_jobs(payload: Dict[str, Any] = Body(...)):
    """
    Takes user's parsed skills & preferences, returns ranked job list with match %.
    Payload: {"skills": ["Python", "React", "AWS"]}
    """
    try:
        user_skills = payload.get("skills", [])
        if not user_skills:
            return []
            
        # Fetch active jobs (we fetch a reasonable batch to rank)
        all_jobs = repo.get_jobs(limit=500)
        
        matched_jobs = match_jobs(user_skills, all_jobs)
        return matched_jobs
    except Exception as e:
        log.error("recommendations_error", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to generate recommendations.")
