# backend/routes/simulator.py - POST /simulate/match
from fastapi import APIRouter, HTTPException
from models.schemas_v2 import SimulateRequest, SimulateResponse
from services.gap_analyzer import analyze_gap
from adapters.supabase_job_repository import SupabaseJobRepository

router = APIRouter()
repo = SupabaseJobRepository()

@router.post("", response_model=SimulateResponse)
async def simulate_match_improvement(request: SimulateRequest):
    try:
        jobs = repo.get_jobs(filters={"id": request.job_id}, limit=1)
        job = jobs[0] if jobs else None
    except Exception:
        job = None
        
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Current match
    _, _, current_pct = analyze_gap(request.current_skills, job)
    
    # Simulated match
    simulated_skills = request.current_skills + request.skills_to_add
    matched_sim, _, simulated_pct = analyze_gap(simulated_skills, job)
    
    delta = simulated_pct - current_pct
    
    # Find newly matched skills
    current_matched, _, _ = analyze_gap(request.current_skills, job)
    newly_matched = list(set(matched_sim) - set(current_matched))
    
    return SimulateResponse(
        job_id=str(job["id"]),
        current_match=current_pct,
        simulated_match=simulated_pct,
        delta=delta,
        newly_matched_skills=newly_matched
    )
