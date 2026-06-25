# backend/tests/test_ingestion.py - test normaliser
from ingestion.normaliser import normalise_job, determine_experience_level

def test_determine_experience_level():
    assert determine_experience_level("Looking for a Senior Python Developer") == "Senior"
    assert determine_experience_level("Junior Developer role") == "Junior"
    assert determine_experience_level("Software Engineer") == "Mid"

def test_normalise_job():
    raw = {
        "source": "adzuna",
        "source_job_id": "123",
        "role": "Backend Engineer",
        "description_raw": "Looking for Python and Docker",
        "required_skills": ["python", "docker"]
    }
    doc = normalise_job(raw)
    assert doc["external_id"] == "adzuna:123"
    assert "python" in doc["required_skills"]
    assert doc["experience_level"] == "Mid"
