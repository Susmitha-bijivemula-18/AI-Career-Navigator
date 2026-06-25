# backend/routes/saved.py - POST/DELETE /saved (future-ready stub)
from fastapi import APIRouter

router = APIRouter()

@router.post("/saved")
async def save_job(job_id: str):
    return {"status": "success", "message": "Job saved (stub)"}

@router.delete("/saved/{job_id}")
async def remove_saved_job(job_id: str):
    return {"status": "success", "message": "Job removed from saved (stub)"}
