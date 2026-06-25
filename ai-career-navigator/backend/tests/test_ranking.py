# backend/tests/test_ranking.py - test composite_score
from services.ranking_engine import composite_score, DummyResume, DummyJob
from datetime import datetime

def test_composite_score():
    resume = DummyResume(["python", "docker", "aws"], "Mid", ["Backend Engineer"])
    job = DummyJob(["python", "docker", "kubernetes"], "Mid", "Backend Engineer", datetime.utcnow(), 60000)
    
    score = composite_score(job, resume)
    # Match % = 2/3 = 66% * 0.50 = 33
    # Level fit = Mid == Mid -> 100 * 0.20 = 20
    # Role = Backend Engineer -> 100 * 0.15 = 15
    # Freshness = just now -> 100 * 0.10 = 10
    # Salary = 60000 -> 100 * 0.05 = 5
    # Total ~ 83
    assert 80 <= score <= 85
