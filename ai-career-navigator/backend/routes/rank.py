# backend/routes/rank.py - Router for real-time job ranking
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List
from bson import ObjectId
from services.database import db
from db.collections import JOBS_COLLECTION, RESUMES_COLLECTION
from services.ranking_engine import composite_score
from core.logging import logger

router = APIRouter()

class RankRequest(BaseModel):
    resume_id: str
    job_ids: List[str]

@router.post("")
@router.post("/")
async def rank_jobs(request: RankRequest):
    """
    Ranks the provided job IDs against the resume's properties and returns the job IDs sorted by composite score.
    """
    logger.info("rank_jobs_request", resume_id=request.resume_id, job_count=len(request.job_ids))

    try:
        res_obj_id = ObjectId(request.resume_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid resume ID format")

    resume = await db[RESUMES_COLLECTION].find_one({"_id": res_obj_id})
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    try:
        job_obj_ids = [ObjectId(jid) for jid in request.job_ids if jid]
    except Exception:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid job ID format in list")

    # Fetch jobs
    jobs = await db[JOBS_COLLECTION].find({"_id": {"$in": job_obj_ids}}).to_list(len(job_obj_ids))
    jobs_map = {str(job["_id"]): job for job in jobs}

    scored_jobs = []
    for jid in request.job_ids:
        job_doc = jobs_map.get(jid)
        if not job_doc:
            # Skip job ID if it is missing from database
            continue
        score = composite_score(job_doc, resume)
        scored_jobs.append((jid, score))

    # Sort based on score descending
    scored_jobs = sorted(scored_jobs, key=lambda x: x[1], reverse=True)
    sorted_ids = [item[0] for item in scored_jobs]

    logger.info("rank_jobs_complete", sorted_count=len(sorted_ids))
    return sorted_ids
