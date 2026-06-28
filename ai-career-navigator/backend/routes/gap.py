# backend/routes/gap.py - POST /gap-analysis
import json
from fastapi import APIRouter, HTTPException
from models.schemas_v2 import GapAnalysisRequest, GapAnalysisResponse
from services.gap_analyzer import analyze_gap
from adapters.supabase_job_repository import SupabaseJobRepository
from datetime import datetime

router = APIRouter()
repo = SupabaseJobRepository()

@router.post("", response_model=GapAnalysisResponse)
async def analyze_skill_gap(request: GapAnalysisRequest):
    # Retrieve the specific job by id
    try:
        # We need a way to get a job by ID from the repo.
        # But if the repo only has get_jobs, we can fetch it like this:
        jobs = repo.get_jobs(filters={"id": request.job_id}, limit=1)
        job = jobs[0] if jobs else None
    except Exception as e:
        job = None

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    matched, missing, pct = analyze_gap(request.resume_skills, job)

    if not missing:
        return GapAnalysisResponse(
            job_id=str(job["id"]),
            matched_skills=matched,
            missing_skills=[],
            match_percentage=pct
        )

    missing_skills_explained = [{"skill": m, "reason": ""} for m in missing]

    return GapAnalysisResponse(
        job_id=str(job["id"]),
        matched_skills=matched,
        missing_skills=missing_skills_explained,
        match_percentage=pct
    )
