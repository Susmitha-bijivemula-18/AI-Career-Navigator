# backend/services/gap_analyzer.py - Skill gap algorithm
from core.utils import normalize_skill

def analyze_gap(resume_skills, job):
    # Map normalized skill -> original spelling in job requirements
    job_skills = job.get("required_skills", [])
    job_norm_map = {}
    for s in job_skills:
        norm = normalize_skill(s)
        if norm:
            job_norm_map[norm] = s
            
    # Normalized set of resume skills
    resume_norm_set = {normalize_skill(s) for s in resume_skills if normalize_skill(s)}
    job_norm_set    = set(job_norm_map.keys())
    
    matched_norm    = resume_norm_set & job_norm_set
    missing_norm    = job_norm_set - resume_norm_set
    
    pct             = round(len(matched_norm) / len(job_norm_set) * 100) if job_norm_set else 0
    
    matched_orig    = [job_norm_map[s] for s in matched_norm]
    missing_orig    = [job_norm_map[s] for s in missing_norm]
    
    return matched_orig, missing_orig, pct


