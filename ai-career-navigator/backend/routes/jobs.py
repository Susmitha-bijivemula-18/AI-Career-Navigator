# routes/jobs.py - Endpoints for getting jobs and matching skills
import json
import os
from fastapi import APIRouter, Query, HTTPException
from services.job_matcher import match_jobs

router = APIRouter()

# Load jobs from JSON file
JOBS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "jobs.json")

def load_jobs():
    try:
        with open(JOBS_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load jobs data.")

@router.get("/")
def get_all_jobs():
    """
    Returns all jobs without match data.
    """
    jobs = load_jobs()
    return jobs

@router.get("/match")
def match_skills_with_jobs(skills: str = Query(..., description="Comma-separated list of skills")):
    """
    Returns matched jobs sorted by match percentage based on provided skills.
    """
    if not skills:
        return []
    
    # Split the skills string into a list
    skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    
    jobs = load_jobs()
    matched_jobs = match_jobs(skill_list, jobs)
    
    return matched_jobs
