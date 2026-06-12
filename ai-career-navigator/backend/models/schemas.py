# models/schemas.py - Pydantic models for request/response validation
from pydantic import BaseModel
from typing import List, Optional

class Job(BaseModel):
    id: int
    company: str
    role: str
    required_skills: List[str]
    apply_url: str

class MatchResult(Job):
    match_percentage: int
    matched_skills: List[str]
    missing_skills: List[str]
