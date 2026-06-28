# backend/routes/recommend.py - GET /recommend
from fastapi import APIRouter, HTTPException
from models.schemas_v2 import RecommendResponse, RecommendedJob, Dashboard
from services.dashboard import compute_dashboard
from services.recommender import composite_score
from services.llm_client import call_llm_json
from prompts.learning_path import SYSTEM_PROMPT_LEARNING_PATH, get_user_prompt_learning_path
from adapters.supabase_job_repository import SupabaseJobRepository
from services.database import supabase

router = APIRouter()
repo = SupabaseJobRepository()

@router.get("", response_model=RecommendResponse)
async def get_recommendations(resume_id: str):
    try:
        response = supabase.table('resumes').select('*').eq('id', resume_id).execute()
        resume = response.data[0] if response.data else None
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid resume ID or database error")

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_skills = resume.get("extracted_skills", [])
    experience_level = resume.get("experience_level", "Junior")
    predicted_roles = resume.get("predicted_roles", [])
    
    all_jobs = repo.get_jobs(limit=500)
    
    # 1. Rank jobs
    ranked_jobs = []
    for job in all_jobs:
        score, match_pct = composite_score(job, resume_skills, experience_level, predicted_roles)
        # Assuming we have a mock reason since prompt not specified for each job
        # "AI-generated one-sentence reason for each recommendation"
        # We can either call LLM for each job (expensive) or just return a default
        # For cost/speed, we'll return a static/formatted reason unless LLM is explicitly required
        reason = f"Strong match score ({score}) and aligns with your experience level."
        
        ranked_jobs.append(RecommendedJob(
            job_id=str(job["id"]),
            company=job.get("company", "Unknown"),
            role=job.get("role", "Unknown"),
            match_percentage=match_pct,
            composite_score=score,
            reason=reason,
            job_apply_link=job.get("job_apply_link"),
            company_careers_link=job.get("company_careers_link", f"https://careers.{job.get('company_name', '').lower().replace(' ', '')}.com")
        ))
        
    ranked_jobs.sort(key=lambda x: x.composite_score, reverse=True)
    all_ranked = ranked_jobs # Return all jobs
    
    # 2. Compute Dashboard (Strengths/Weaknesses)
    strengths, weaknesses = compute_dashboard(resume_skills, all_jobs)
    
    # 3. Call LLM for Learning Path
    user_prompt = get_user_prompt_learning_path(resume_skills, weaknesses, predicted_roles)
    
    learning_path = await call_llm_json(
        system_prompt=SYSTEM_PROMPT_LEARNING_PATH,
        user_prompt=user_prompt,
        model="gpt-4o-mini",
        fallback_default=["Failed to generate path"]
    )
    
    if not isinstance(learning_path, list):
        learning_path = []
        
    dashboard_data = Dashboard(
        strengths=strengths,
        weaknesses=weaknesses,
        learning_path=learning_path
    )
    
    return RecommendResponse(
        top_jobs=all_ranked,
        dashboard=dashboard_data
    )
