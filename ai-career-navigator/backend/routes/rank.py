# backend/routes/rank.py - POST /rank/jobs
from fastapi import APIRouter, Request
from models.schemas_v3 import RankRequest
from services.ranking_engine import composite_score, DummyResume, DummyJob
from services.database import supabase

router = APIRouter()

@router.post("/rank/jobs")
async def rank_jobs(request: Request, payload: RankRequest):
    # Mock resume context
    mock_resume = DummyResume(
        skills=["python", "docker", "fastapi"], 
        level="Mid", 
        predicted_roles=["Backend Engineer"]
    )
    response = supabase.table('jobs').select('*').in_('id', payload.job_ids).execute()
    jobs = response.data if response.data else []
    
    scored = []
    for job in jobs:
        d_job = DummyJob(
            required_skills=job.get("required_skills", []),
            level=job.get("experience_level", "Mid"),
            role=job.get("role", ""),
            posted_at=job.get("posted_at"),
            salary_min=job.get("salary_min")
        )
        c_score = composite_score(d_job, mock_resume)
        scored.append((str(job["id"]), c_score))
        
    scored.sort(key=lambda x: x[1], reverse=True)
    return [s[0] for s in scored]
