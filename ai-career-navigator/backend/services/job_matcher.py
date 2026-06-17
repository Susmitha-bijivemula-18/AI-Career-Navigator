# services/job_matcher.py - Compute match percentage and missing skills
from core.utils import normalize_skill

def match_jobs(resume_skills: list[str], jobs: list[dict]) -> list[dict]:
    """
    Compares extracted skills against job requirements and calculates match percentage.
    """
    resume_norm_set = {normalize_skill(s) for s in resume_skills if normalize_skill(s)}
    results = []
    for job in jobs:
        job_skills = job.get("required_skills", [])
        job_norm_map = {}
        for s in job_skills:
            norm = normalize_skill(s)
            if norm:
                job_norm_map[norm] = s
        job_norm_set = set(job_norm_map.keys())
        
        matched_norm = resume_norm_set & job_norm_set
        missing_norm = job_norm_set - resume_norm_set
        pct          = round(len(matched_norm) / len(job_norm_set) * 100) if job_norm_set else 0
        results.append({
            **job,
            "match_percentage": pct,
            "matched_skills":   [job_norm_map[s] for s in matched_norm],
            "missing_skills":   [job_norm_map[s] for s in missing_norm],
        })
    return sorted(results, key=lambda x: x["match_percentage"], reverse=True)

