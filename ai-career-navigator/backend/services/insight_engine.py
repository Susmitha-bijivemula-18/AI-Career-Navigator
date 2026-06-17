# backend/services/insight_engine.py - Marketplace job stats generator
from collections import Counter, defaultdict
from datetime import datetime
from db.collections import INSIGHTS_COLLECTION
from core.logging import logger

async def compute_insights(db) -> dict:
    """
    Analyzes active jobs to compute overall and trending skill demand.
    """
    logger.info("insight_engine_compute_start")
    
    # Retrieve all active jobs (capped at a reasonable amount to avoid memory overflow, e.g. 5000)
    jobs = await db.jobs.find({"is_active": True}).to_list(5000)
    logger.info("insight_engine_active_jobs_loaded", count=len(jobs))

    skill_counter = Counter()
    role_counter = Counter()
    salary_by_role = defaultdict(list)

    for job in jobs:
        # Count skills
        for skill in job.get("required_skills", []):
            if skill:
                skill_counter[skill.lower().strip()] += 1
                
        # Count roles
        role = job.get("role") or "Unknown Role"
        role_counter[role] += 1
        
        # Accumulate salary info
        sal_min = job.get("salary_min")
        sal_max = job.get("salary_max")
        if sal_min:
            salary_by_role[role].append(sal_min)
        elif sal_max:
            salary_by_role[role].append(sal_max)

    # Growth % = compare with previous insights snapshot
    prev = await db[INSIGHTS_COLLECTION].find_one(sort=[("computed_at", -1)])
    prev_counts = {}
    if prev and "trending_skills" in prev:
        for s in prev["trending_skills"]:
            prev_counts[s["skill"].lower()] = s.get("job_count", 0)

    # Compute trending list for top 30 skills
    trending = []
    for skill, count in skill_counter.most_common(30):
        # Format skill nicely (e.g. Python, React)
        formatted_skill = skill.title() if len(skill) > 2 else skill.upper()
        
        prev_c = prev_counts.get(skill, count)
        growth = round(((count - prev_c) / max(prev_c, 1)) * 100, 1)
        trending.append({
            "skill": formatted_skill, 
            "job_count": count,
            "growth_pct": growth
        })

    # Top 20 most requested skills overall
    most_requested = []
    for skill, _ in skill_counter.most_common(20):
        most_requested.append(skill.title() if len(skill) > 2 else skill.upper())

    # Build average salary structure
    avg_salary_by_role = {}
    for role, vals in salary_by_role.items():
        if vals:
            avg_salary_by_role[role] = round(sum(vals) / len(vals))

    doc = {
        "computed_at": datetime.utcnow(),
        "trending_skills": trending,
        "most_requested": most_requested,
        "role_demand": dict(role_counter),
        "avg_salary_by_role": avg_salary_by_role
    }

    await db[INSIGHTS_COLLECTION].insert_one(doc)
    logger.info("insight_engine_compute_success")
    return doc
