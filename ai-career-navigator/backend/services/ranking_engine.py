# backend/services/ranking_engine.py - Composite job ranking algorithm
from datetime import datetime
from typing import Any, List

WEIGHTS = {
    "match_pct":       0.50,   # skill overlap score
    "level_fit":       0.20,   # experience level alignment
    "role_alignment":  0.15,   # predicted role match
    "freshness":       0.10,   # recency bonus
    "salary_fit":      0.05    # salary range presence bonus
}

def _get_attr(obj: Any, field: str, default: Any = None) -> Any:
    """Helper to retrieve attributes from either a dictionary or a Pydantic object."""
    if isinstance(obj, dict):
        return obj.get(field, default)
    return getattr(obj, field, default)

from core.utils import normalize_skill

def calc_match_pct(resume_skills: List[str], job_skills: List[str]) -> int:
    """Calculates skill match percentage."""
    if not job_skills:
        return 0
    resume_set = set(normalize_skill(s) for s in resume_skills if normalize_skill(s))
    job_set = set(normalize_skill(s) for s in job_skills if normalize_skill(s))
    matched = resume_set & job_set
    return round((len(matched) / len(job_set)) * 100) if job_set else 0


def composite_score(job: Any, resume: Any) -> int:
    """
    Computes a score from 0-100 representing how well a job fits a candidate's resume.
    """
    # 1. Match percentage (0–100)
    resume_skills = _get_attr(resume, "skills") or _get_attr(resume, "extracted_skills") or []
    job_skills = _get_attr(job, "required_skills") or []
    match = calc_match_pct(resume_skills, job_skills)

    # 2. Level fit (0 or 100)
    level_map = {"Junior": 1, "Mid": 2, "Senior": 3}
    res_lvl = _get_attr(resume, "experience_level") or _get_attr(resume, "level") or "Mid"
    job_lvl = _get_attr(job, "experience_level") or _get_attr(job, "level") or "Mid"
    
    # Standardise representation (e.g. Lead/Principal -> Senior)
    if res_lvl not in level_map:
        res_lvl = "Mid"
    if job_lvl not in level_map:
        job_lvl = "Mid"
        
    diff = abs(level_map.get(res_lvl, 2) - level_map.get(job_lvl, 2))
    level = 100 if diff == 0 else (60 if diff == 1 else 20)

    # 3. Role alignment (0 or 100)
    predicted_roles = _get_attr(resume, "predicted_roles") or []
    job_role = _get_attr(job, "role") or ""
    role = 100 if any(
        r.lower() in job_role.lower() for r in predicted_roles if r
    ) else 0

    # 4. Freshness (0–100, decay by hours since posting)
    posted_at = _get_attr(job, "posted_at")
    if isinstance(posted_at, str):
        try:
            from ingestion.normaliser import parse_date
            posted_at = parse_date(posted_at)
        except Exception:
            posted_at = datetime.utcnow()
    elif not isinstance(posted_at, datetime):
        posted_at = datetime.utcnow()
        
    hours_old = (datetime.utcnow() - posted_at).total_seconds() / 3600
    fresh = max(0.0, 100.0 - (hours_old / 24.0) * 10.0)

    # 5. Salary fit (0 or 100)
    salary = 100 if _get_attr(job, "salary_min") else 0

    score = (
        match   * WEIGHTS["match_pct"]     +
        level   * WEIGHTS["level_fit"]     +
        role    * WEIGHTS["role_alignment"] +
        fresh   * WEIGHTS["freshness"]     +
        salary  * WEIGHTS["salary_fit"]
    )
    return round(score)
