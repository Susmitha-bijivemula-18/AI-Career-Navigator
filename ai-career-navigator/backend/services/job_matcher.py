# services/job_matcher.py - Compute match percentage and missing skills

def match_jobs(resume_skills: list[str], jobs: list[dict]) -> list[dict]:
    """
    Compares extracted skills against job requirements and calculates match percentage.
    """
    resume_set = set(s.lower() for s in resume_skills)
    results = []
    for job in jobs:
        job_set   = set(s.lower() for s in job.get("required_skills", []))
        matched   = list(resume_set & job_set)
        missing   = list(job_set - resume_set)
        pct       = round(len(matched) / len(job_set) * 100) if job_set else 0
        results.append({
            **job,
            "match_percentage": pct,
            "matched_skills":   [s.title() for s in matched],
            "missing_skills":   [s.title() for s in missing],
        })
    return sorted(results, key=lambda x: x["match_percentage"], reverse=True)
