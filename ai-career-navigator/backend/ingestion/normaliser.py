# backend/ingestion/normaliser.py - Normalise RawJob to JobDocument
import re
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from typing import List
from ingestion.base_fetcher import RawJob
from models.schemas_v3 import JobDocument
from services.skill_extractor import extract_skills

def parse_date(date_str: str) -> datetime:
    """
    Parses a date string (ISO 8601, RFC 822/RSS, or timestamp) to datetime.
    """
    # 1. Check if numeric timestamp
    if date_str.isdigit():
        return datetime.fromtimestamp(int(date_str), tz=timezone.utc)
    
    # 2. Try parsing as RSS / RFC 822 (email format)
    try:
        dt = parsedate_to_datetime(date_str)
        # Convert to UTC
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    except Exception:
        pass

    # 3. Try standard ISO format
    try:
        # Strip 'Z' suffix and replace with +00:00 for fromisoformat
        clean_str = date_str
        if clean_str.endswith('Z'):
            clean_str = clean_str[:-1] + '+00:00'
        dt = datetime.fromisoformat(clean_str)
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    except Exception:
        pass

    # Fallback to current time
    return datetime.utcnow()

def detect_experience_level(title: str, description: str) -> str:
    """
    Detects experience level (Junior, Mid, Senior) based on title and description keywords.
    """
    combined = (title + " " + description).lower()
    
    senior_keywords = [r"\bsenior\b", r"\bsr\b", r"\blead\b", r"\bprincipal\b", r"\barchitect\b", r"\bmanager\b"]
    junior_keywords = [r"\bjunior\b", r"\bjr\b", r"\bentry\b", r"\bintern\b", r"\bgraduate\b", r"\bassociate\b"]
    
    for pattern in senior_keywords:
        if re.search(pattern, combined):
            return "Senior"
            
    for pattern in junior_keywords:
        if re.search(pattern, combined):
            return "Junior"
            
    return "Mid"

def normalise_job(raw: RawJob) -> JobDocument:
    """
    Maps a RawJob to a JobDocument, performing skill extraction and level detection.
    """
    fetched_now = datetime.utcnow()
    posted_dt = parse_date(raw.posted_at_raw)
    
    # Extract skills
    skills = extract_skills(raw.description_raw)
    # Also attempt skill extraction on role/title in case description is brief
    skills_title = extract_skills(raw.role)
    unique_skills = sorted(list(set(skills + skills_title)))
    
    # Detect experience level
    exp_level = detect_experience_level(raw.role, raw.description_raw)
    
    return JobDocument(
        external_id=f"{raw.source_name}:{raw.source_job_id}",
        source=raw.source_name,
        company=raw.company,
        role=raw.role,
        location=raw.location,
        remote=raw.remote,
        required_skills=unique_skills,
        experience_level=exp_level,
        salary_min=raw.salary_min,
        salary_max=raw.salary_max,
        apply_url=raw.apply_url,
        posted_at=posted_dt,
        fetched_at=fetched_now,
        expires_at=fetched_now + timedelta(days=30),
        is_active=True,
        description_raw=raw.description_raw,
        tags=raw.tags
    )
