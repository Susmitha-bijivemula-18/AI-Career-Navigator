# backend/routes/gap.py - POST /gap-analysis
import json
from fastapi import APIRouter, HTTPException
from models.schemas_v2 import GapAnalysisRequest, GapAnalysisResponse
from services.gap_analyzer import analyze_gap
from services.database import gap_cache_collection
from routes.jobs import load_jobs
from datetime import datetime

router = APIRouter()

@router.post("", response_model=GapAnalysisResponse)
async def analyze_skill_gap(request: GapAnalysisRequest):
    jobs = load_jobs()
    # Find job by id (handling int vs str safely)
    job = next((j for j in jobs if str(j.get("id")) == str(request.job_id)), None)
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
