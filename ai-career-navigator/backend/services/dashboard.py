# backend/services/dashboard.py - Dashboard logic
from collections import Counter
from core.utils import normalize_skill

def compute_dashboard(resume_skills, all_jobs):
    skill_presence = Counter()
    skill_absence  = Counter()
    total_jobs = len(all_jobs)
    
    orig_map = {}
    for r in resume_skills:
        norm = normalize_skill(r)
        if norm:
            orig_map[norm] = r
        
    for job in all_jobs:
        for s in job.get("required_skills", []):
            norm = normalize_skill(s)
            if norm:
                orig_map[norm] = s
            
    resume_set = {normalize_skill(r) for r in resume_skills if normalize_skill(r)}
    
    for job in all_jobs:
        job_set = {normalize_skill(s) for s in job.get("required_skills", []) if normalize_skill(s)}
        for s in job_set:
            if s in resume_set:
                skill_presence[s] += 1
            else:
                skill_absence[s] += 1
    
    # Strengths = present in >=50% of jobs
    strengths = [
        {"skill": orig_map[s], "count": c}
        for s, c in skill_presence.items()
        if c >= total_jobs * 0.5
    ]
    
    # Weaknesses = missing from >=60% of jobs
    weaknesses = [
        {"skill": orig_map[s], "missing_count": c}
        for s, c in skill_absence.items()
        if c >= total_jobs * 0.6
    ]
    
    return strengths, weaknesses

