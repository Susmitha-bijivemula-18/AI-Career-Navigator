from datetime import datetime, timedelta
from services.ranking_engine import calc_match_pct, composite_score
from core.utils import normalize_skill

def test_calc_match_pct():
    # Test case-insensitivity, spacing, and empty lists
    assert calc_match_pct([], ["Python", "React"]) == 0
    assert calc_match_pct(["python", "react"], ["Python", "React"]) == 100
    assert calc_match_pct(["python"], ["Python", "React"]) == 50
    assert calc_match_pct(["  python  ", "django"], ["Python", "React"]) == 50
    assert calc_match_pct(["python", "react", "docker"], ["Python", "React"]) == 100

def test_composite_score_perfect_fit():
    # A perfect job-resume alignment
    # Match percentage = 100 (50 points)
    # Level fit: Junior to Junior = 100 (20 points)
    # Role alignment: 'Backend Developer' contains 'Backend' = 100 (15 points)
    # Freshness: Posted now = 100 (10 points)
    # Salary fit: salary_min present = 100 (5 points)
    # Expected total score = 50 + 20 + 15 + 10 + 5 = 100
    
    resume = {
        "skills": ["python", "fastapi"],
        "experience_level": "Junior",
        "predicted_roles": ["Backend"]
    }
    
    job = {
        "required_skills": ["python", "fastapi"],
        "experience_level": "Junior",
        "role": "Backend Developer",
        "posted_at": datetime.utcnow(),
        "salary_min": 80000
    }
    
    assert composite_score(job, resume) == 100

def test_composite_score_level_fits():
    # Test different level discrepancies
    resume_jr = {"skills": ["python"], "experience_level": "Junior", "predicted_roles": []}
    resume_mid = {"skills": ["python"], "experience_level": "Mid", "predicted_roles": []}
    resume_sr = {"skills": ["python"], "experience_level": "Senior", "predicted_roles": []}
    
    job_jr = {"required_skills": ["python"], "experience_level": "Junior", "role": "", "posted_at": datetime.utcnow(), "salary_min": None}
    
    # 1. Junior-Junior (diff = 0) -> level fit = 100 * 0.20 = 20 points
    # Other scores: match_pct=100 (50), role=0, fresh=100 (10), salary=0
    # Expected total: 50 + 20 + 0 + 10 + 0 = 80
    assert composite_score(job_jr, resume_jr) == 80
    
    # 2. Mid-Junior (diff = 1) -> level fit = 60 * 0.20 = 12 points
    # Expected total: 50 + 12 + 0 + 10 + 0 = 72
    assert composite_score(job_jr, resume_mid) == 72
    
    # 3. Senior-Junior (diff = 2) -> level fit = 20 * 0.20 = 4 points
    # Expected total: 50 + 4 + 0 + 10 + 0 = 64
    assert composite_score(job_jr, resume_sr) == 64

def test_composite_score_role_alignment():
    # Test role match vs mismatch
    resume = {
        "skills": [],
        "experience_level": "Mid",
        "predicted_roles": ["Frontend", "React Developer"]
    }
    
    job_matched = {
        "required_skills": [],
        "experience_level": "Mid",
        "role": "Senior Frontend Architect",
        "posted_at": datetime.utcnow(),
        "salary_min": None
    }
    
    job_mismatched = {
        "required_skills": [],
        "experience_level": "Mid",
        "role": "Data Engineer",
        "posted_at": datetime.utcnow(),
        "salary_min": None
    }
    
    # Matching: match=0, level=100 (20), role=100 (15), fresh=100 (10), salary=0 -> 45
    assert composite_score(job_matched, resume) == 45
    # Mismatching: match=0, level=20, role=0, fresh=10, salary=0 -> 30
    assert composite_score(job_mismatched, resume) == 30

def test_composite_score_freshness_decay():
    resume = {
        "skills": [],
        "experience_level": "Mid",
        "predicted_roles": []
    }
    
    # Job posted 5 days ago (5 * 24 = 120 hours)
    # Decay: -10 per day -> 5 * 10 = 50 points decay
    # Freshness score = 50 -> 50 * 0.10 = 5 points
    # Level fit = 100 * 0.20 = 20 points
    # Expected total: 0 + 20 + 0 + 5 + 0 = 25
    job_5_days = {
        "required_skills": [],
        "experience_level": "Mid",
        "role": "Developer",
        "posted_at": datetime.utcnow() - timedelta(days=5),
        "salary_min": None
    }
    assert composite_score(job_5_days, resume) == 25
    
    # Job posted 15 days ago -> decay is 150 points -> capped floor 0
    # Expected total: 0 + 20 + 0 + 0 + 0 = 20
    job_15_days = {
        "required_skills": [],
        "experience_level": "Mid",
        "role": "Developer",
        "posted_at": datetime.utcnow() - timedelta(days=15),
        "salary_min": None
    }
    assert composite_score(job_15_days, resume) == 20

def test_compatibility_resume_field_names():
    # Verify support for both 'skills'/'extracted_skills' and 'experience_level'/'level'
    resume_alternative = {
        "extracted_skills": ["python"],
        "level": "Senior",
        "predicted_roles": ["Backend"]
    }
    
    job_alternative = {
        "required_skills": ["python"],
        "level": "Senior",
        "role": "Backend Team Lead",
        "posted_at": datetime.utcnow(),
        "salary_min": 120000
    }
    
    # Match: 100 (50), Level: Senior-Senior = 100 (20), Role: Backend (15), Fresh: 100 (10), Salary: 120k (5)
    # Total = 100
    assert composite_score(job_alternative, resume_alternative) == 100

def test_normalize_skill():
    assert normalize_skill("REST API") == "restapi"
    assert normalize_skill("REST APIs") == "restapi"
    assert normalize_skill("Fast API") == "fastapi"
    assert normalize_skill("FastAPI") == "fastapi"
    assert normalize_skill("Git") == "git"
    assert normalize_skill("CSS") == "css"
    assert normalize_skill("Node.js") == "nodejs"
    assert normalize_skill("ReactJS") == "reactjs"
