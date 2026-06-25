# backend/services/feed_service.py - assembles ranked, fresh job feed
from services.database import supabase
from services.ranking_engine import composite_score, DummyResume, DummyJob
from services.freshness import freshness_label

async def build_feed(db, resume_id: str):
    # Retrieve resume context (assuming Phase 1 or mock)
    # mock_resume = await db.resumes.find_one({"_id": ObjectId(resume_id)})
    mock_resume = DummyResume(
        skills=["python", "docker", "fastapi"], 
        level="Mid", 
        predicted_roles=["Backend Engineer", "Software Engineer"]
    )

    response = supabase.table('jobs').select('*').eq('is_active', True).execute()
    jobs = response.data if response.data else []
    
    results = []
    for job in jobs:
        # Build dummy job for ranking
        d_job = DummyJob(
            required_skills=job.get("required_skills", []),
            level=job.get("experience_level", "Mid"),
            role=job.get("role", ""),
            posted_at=job.get("posted_at"),
            salary_min=job.get("salary_min")
        )
        
        c_score = composite_score(d_job, mock_resume)
        
        # Calculate matching & missing skills explicitly
        job_skills = set([s.lower() for s in job.get("required_skills", [])])
        res_skills = set([s.lower() for s in mock_resume.skills])
        matched = list(job_skills & res_skills)
        missing = list(job_skills - res_skills)
        match_pct = round(len(matched) / max(len(job_skills), 1) * 100)
        
        salary_str = None
        if job.get("salary_min") and job.get("salary_max"):
            salary_str = f"£{job['salary_min']//1000}k-£{job['salary_max']//1000}k"
            
        results.append({
            "id": str(job["id"]),
            "company": job.get("company"),
            "role": job.get("role"),
            "match_percentage": match_pct,
            "composite_score": c_score,
            "freshness_label": freshness_label(job.get("posted_at")),
            "matched_skills": matched,
            "missing_skills": missing,
            "salary_range": salary_str,
            "remote": job.get("remote", False),
            "apply_url": job.get("apply_url", "")
        })

    # Sort by composite_score descending
    results.sort(key=lambda x: x["composite_score"], reverse=True)
    return results
