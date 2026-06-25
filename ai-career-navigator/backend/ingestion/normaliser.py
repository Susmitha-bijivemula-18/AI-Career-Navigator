# backend/ingestion/normaliser.py - maps all sources to JobDocument schema
from datetime import datetime, timedelta
from typing import Dict, Any, List
# Assuming Phase 1 skill_extractor exists
try:
    from services.skill_extractor import extract_skills
except ImportError:
    def extract_skills(text: str) -> List[str]: return []

def determine_experience_level(text: str) -> str:
    text_lower = text.lower()
    if "senior" in text_lower or "lead" in text_lower or "principal" in text_lower:
        return "Senior"
    if "junior" in text_lower or "entry" in text_lower or "graduate" in text_lower:
        return "Junior"
    return "Mid"

def normalise_job(raw_job: Dict[str, Any]) -> Dict[str, Any]:
    source = raw_job.get("source", "unknown")
    source_id = raw_job.get("source_job_id", "")
    external_id = f"{source}:{source_id}"
    
    posted_at = raw_job.get("posted_at")
    if isinstance(posted_at, str):
        try:
            posted_at = datetime.fromisoformat(posted_at.replace("Z", "+00:00"))
        except ValueError:
            posted_at = datetime.utcnow()
    elif not posted_at:
        posted_at = datetime.utcnow()
        
    fetched_at = datetime.utcnow()
    expires_at = fetched_at + timedelta(days=30)
    
    title = raw_job.get("role", "")
    desc = raw_job.get("description_raw", "")
    full_text = f"{title} {desc}"
    
    required_skills = raw_job.get("required_skills")
    if not required_skills:
        required_skills = extract_skills(full_text)
        
    return {
        "external_id": external_id,
        "source": source,
        "company": raw_job.get("company", "Unknown"),
        "role": title,
        "location": raw_job.get("location", ""),
        "remote": raw_job.get("remote", False),
        "required_skills": required_skills,
        "experience_level": determine_experience_level(full_text),
        "salary_min": raw_job.get("salary_min"),
        "salary_max": raw_job.get("salary_max"),
        "apply_url": raw_job.get("apply_url", ""),
        "posted_at": posted_at,
        "fetched_at": fetched_at,
        "expires_at": expires_at,
        "is_active": True,
        "description_raw": desc,
        "tags": raw_job.get("tags", [])
    }
