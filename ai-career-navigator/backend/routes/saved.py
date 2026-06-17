# backend/routes/saved.py - Stub endpoints for saved jobs
from fastapi import APIRouter, status
from pydantic import BaseModel
from core.logging import logger

router = APIRouter()

class SavedJobRequest(BaseModel):
    resume_id: str
    job_id: str

@router.post("")
@router.post("/")
async def save_job(request: SavedJobRequest):
    """
    Stub endpoint to bookmark a job.
    """
    logger.info("save_job_stub_triggered", resume_id=request.resume_id, job_id=request.job_id)
    return {
        "status": "success",
        "message": "Job bookmarked successfully (Stub).",
        "resume_id": request.resume_id,
        "job_id": request.job_id
    }

@router.delete("")
@router.delete("/")
async def unsave_job(request: SavedJobRequest):
    """
    Stub endpoint to remove a bookmarked job.
    """
    logger.info("unsave_job_stub_triggered", resume_id=request.resume_id, job_id=request.job_id)
    return {
        "status": "success",
        "message": "Job bookmark removed successfully (Stub).",
        "resume_id": request.resume_id,
        "job_id": request.job_id
    }
