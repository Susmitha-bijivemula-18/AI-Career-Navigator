# backend/services/ranking_engine.py - composite scoring algorithm
from datetime import datetime

WEIGHTS = {
    "match_pct":       0.50,
    "level_fit":       0.20,
    "role_alignment":  0.15,
    "freshness":       0.10,
    "salary_fit":      0.05
}

def calc_match_pct(resume_skills: set, job_skills: set) -> int:
    if not job_skills:
        return 0
    matched = resume_skills & job_skills
    return round(len(matched) / len(job_skills) * 100)

class DummyResume:
    # Helper to mock Resume object for testing/ranking
    def __init__(self, skills, level, predicted_roles):
        self.skills = skills
        self.level = level
        self.predicted_roles = predicted_roles

class DummyJob:
    # Helper to mock Job object
    def __init__(self, required_skills, level, role, posted_at, salary_min):
        self.required_skills = required_skills
        self.level = level
        self.role = role
        self.posted_at = posted_at
        self.salary_min = salary_min

def composite_score(job, resume) -> int:
    # 1. Match percentage (0-100)
    match = calc_match_pct(set(resume.skills), set(job.required_skills))

    # 2. Level fit (0 or 100)
    level_map = {"Junior": 1, "Mid": 2, "Senior": 3}
    diff = abs(level_map.get(resume.level, 2) - level_map.get(job.level, 2))
    level = 100 if diff == 0 else (60 if diff == 1 else 20)

    # 3. Role alignment (0 or 100)
    role = 100 if any(
        r.lower() in job.role.lower() for r in resume.predicted_roles
    ) else 0

    # 4. Freshness (0-100, decay by hours since posting)
    hours_old = (datetime.utcnow() - job.posted_at).total_seconds() / 3600
    fresh = max(0, 100 - (hours_old / 24) * 10)

    # 5. Salary fit (0 or 100)
    salary = 100 if job.salary_min else 0

    score = (
        match   * WEIGHTS["match_pct"]     +
        level   * WEIGHTS["level_fit"]     +
        role    * WEIGHTS["role_alignment"] +
        fresh   * WEIGHTS["freshness"]     +
        salary  * WEIGHTS["salary_fit"]
    )
    return round(score)
