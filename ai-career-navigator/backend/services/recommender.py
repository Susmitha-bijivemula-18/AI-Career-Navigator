# backend/services/recommender.py - Recommendation ranking algorithm
from services.gap_analyzer import analyze_gap

def composite_score(job, resume_skills, experience_level, predicted_roles):
    # Weight 1: match percentage (80%)
    _, _, match_pct = analyze_gap(resume_skills, job)
    
    # Weight 2: experience level fit (10%)
    level_fit = 1.0 if job.get("level") == experience_level else 0.5
    
    # Weight 3: role alignment (10%)
    # Use keyword matching to match "Frontend Developer" with "Frontend Engineer"
    job_role = job.get("role", "").lower()
    
    def get_core_keywords(role_str):
        ignore_words = {"engineer", "developer", "scientist", "architect", "analyst", "manager"}
        return {w for w in role_str.split() if w not in ignore_words}
        
    job_keywords = get_core_keywords(job_role)
    role_match = 0.0
    
    for role in predicted_roles:
        pr_keywords = get_core_keywords(role.lower())
        if job_keywords & pr_keywords:  # If there is an intersection in core keywords
            role_match = 1.0
            break
            
    # Calculate score: 80% skills + 10% level + 10% role
    score = (match_pct * 0.80) + (level_fit * 100 * 0.10) + (role_match * 100 * 0.10)
    return round(score), match_pct
