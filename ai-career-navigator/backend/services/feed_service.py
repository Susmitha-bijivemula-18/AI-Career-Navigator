# backend/services/feed_service.py - Feed compilation and scoring Coordinator
from bson import ObjectId
from services.database import db
from db.collections import JOBS_COLLECTION, RESUMES_COLLECTION
from services.ranking_engine import composite_score, calc_match_pct
from services.freshness import freshness_label
from core.logging import logger
from core.utils import normalize_skill

def format_salary_range(min_val: int | None, max_val: int | None, source: str) -> str:
    """Formats salary min and max with currency symbol based on job source."""
    currency = "£" if source == "adzuna" else "$"
    if min_val and max_val:
        return f"{currency}{int(min_val // 1000)}k–{currency}{int(max_val // 1000)}k"
    elif min_val:
        return f"From {currency}{int(min_val // 1000)}k"
    elif max_val:
        return f"Up to {currency}{int(max_val // 1000)}k"
    return "Competitive"

async def build_feed(resume_id: str, limit: int = 20, offset: int = 0) -> dict:
    """
    Ranks, paginates, and compiles active job documents matching user resume.
    """
    logger.info("build_feed_start", resume_id=resume_id, limit=limit, offset=offset)
    
    # 1. Fetch user resume
    try:
        res_obj_id = ObjectId(resume_id)
    except Exception:
        raise ValueError(f"Invalid resume ID format: {resume_id}")

    resume = await db[RESUMES_COLLECTION].find_one({"_id": res_obj_id})
    if not resume:
        raise ValueError(f"Resume with ID {resume_id} not found")

    resume_skills = resume.get("skills") or resume.get("extracted_skills") or []
    resume_skills_norm = {normalize_skill(s) for s in resume_skills if normalize_skill(s)}

    # 2. Get active jobs (capping at 1000 for server efficiency)
    jobs = await db[JOBS_COLLECTION].find({"is_active": True}).to_list(1000)
    logger.info("build_feed_jobs_fetched", active_count=len(jobs))

    ranked_jobs = []
    for job in jobs:
        # Calculate composite alignment score
        score = composite_score(job, resume)
        
        job_skills = job.get("required_skills", [])
        matched = [s for s in job_skills if s and normalize_skill(s) in resume_skills_norm]
        missing = [s for s in job_skills if s and normalize_skill(s) not in resume_skills_norm]
        
        match_pct = calc_match_pct(resume_skills, job_skills)
        
        # Freshness label conversion
        fresh_lbl = freshness_label(job.get("posted_at"))
        
        # Salary string formatting
        salary_range_str = format_salary_range(
            job.get("salary_min"), 
            job.get("salary_max"), 
            job.get("source", "")
        )

        ranked_jobs.append({
            "id": str(job["_id"]),
            "company": job.get("company", "Unknown Company"),
            "role": job.get("role", "Unknown Role"),
            "match_percentage": match_pct,
            "composite_score": score,
            "freshness_label": fresh_lbl,
            "matched_skills": matched,
            "missing_skills": missing,
            "salary_range": salary_range_str,
            "remote": job.get("remote", False),
            "apply_url": job.get("apply_url", "")
        })

    # Sort descending based on alignment score
    ranked_jobs = sorted(ranked_jobs, key=lambda x: x["composite_score"], reverse=True)

    total = len(ranked_jobs)
    paginated_jobs = ranked_jobs[offset : offset + limit]

    page_num = (offset // limit) + 1 if limit > 0 else 1

    return {
        "jobs": paginated_jobs,
        "total": total,
        "page": page_num
    }
