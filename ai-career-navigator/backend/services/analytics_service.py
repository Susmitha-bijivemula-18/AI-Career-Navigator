# backend/services/analytics_service.py - Computes charts data and aggregates skill distribution
from datetime import datetime
from collections import Counter
from services.database import db
from db.collections import JOBS_COLLECTION, ANALYTICS_SNAPSHOTS_COLLECTION, RESUMES_COLLECTION
from services.ranking_engine import calc_match_pct, composite_score
from bson import ObjectId
from core.logging import logger

async def generate_analytics(resume_id: str) -> dict:
    """
    Evaluates candidate skills against active jobs to produce charts stats.
    Saves snapshot to MongoDB.
    """
    logger.info("analytics_generation_start", resume_id=resume_id)
    
    # 1. Retrieve user resume
    try:
        res_obj_id = ObjectId(resume_id)
    except Exception:
        raise ValueError(f"Invalid resume ID format: {resume_id}")
        
    resume = await db[RESUMES_COLLECTION].find_one({"_id": res_obj_id})
    if not resume:
        raise ValueError(f"Resume with ID {resume_id} not found")

    resume_skills = resume.get("skills") or resume.get("extracted_skills") or []
    resume_skills_lower = [s.lower().strip() for s in resume_skills]

    # 2. Retrieve active jobs (taking up to 100 for score calculation and aggregation)
    jobs = await db[JOBS_COLLECTION].find({"is_active": True}).to_list(100)
    if not jobs:
        logger.warning("analytics_generation_no_jobs_found")
        return {
            "skill_distribution": {},
            "match_scores": [],
            "avg_match_pct": 0.0,
            "top_missing": []
        }

    skill_distribution = Counter()
    match_scores = []
    missing_skills_counter = Counter()
    total_match_pct = 0.0

    for job in jobs:
        job_skills = job.get("required_skills", [])
        
        # Calculate match percentage
        match_pct = calc_match_pct(resume_skills, job_skills)
        total_match_pct += match_pct
        
        # Calculate composite score
        score = composite_score(job, resume)
        match_scores.append({
            "job_id": str(job["_id"]),
            "role": job.get("role", "Unknown Role"),
            "score": score
        })

        # Calculate skill overlaps
        for s in job_skills:
            if not s:
                continue
            s_clean = s.strip()
            if s_clean.lower() in resume_skills_lower:
                skill_distribution[s_clean] += 1
            else:
                missing_skills_counter[s_clean] += 1

    # Take top 10 matched jobs
    match_scores = sorted(match_scores, key=lambda x: x["score"], reverse=True)[:10]

    # Average match percentage
    avg_match_pct = round(total_match_pct / len(jobs), 1) if jobs else 0.0
    
    # Top 5 missing skills
    top_missing = [s for s, _ in missing_skills_counter.most_common(5)]

    # Format the snapshot response
    snapshot = {
        "resume_id": resume_id,
        "snapshot_at": datetime.utcnow(),
        "skill_distribution": dict(skill_distribution),
        "match_scores": match_scores,
        "avg_match_pct": avg_match_pct,
        "top_missing": top_missing
    }

    # Store snapshot in DB
    await db[ANALYTICS_SNAPSHOTS_COLLECTION].insert_one(snapshot.copy())
    logger.info("analytics_generation_complete", resume_id=resume_id)

    # Clean up DB specific fields from returned output
    snapshot.pop("_id", None)
    snapshot.pop("resume_id", None)
    snapshot.pop("snapshot_at", None)
    return snapshot
