# backend/models/schemas_v3.py - Pydantic v2 schemas for Phase 3 collections and APIs
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Dict, Optional

# --- Job Models ---
class JobDocument(BaseModel):
    external_id: str
    source: str
    company: str
    role: str
    location: str
    remote: bool
    required_skills: List[str]
    experience_level: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    apply_url: str
    posted_at: datetime
    fetched_at: datetime
    expires_at: datetime
    is_active: bool
    description_raw: str
    tags: List[str]

class JobFeedItem(BaseModel):
    id: str
    company: str
    role: str
    match_percentage: int
    composite_score: int
    freshness_label: str
    matched_skills: List[str]
    missing_skills: List[str]
    salary_range: str
    remote: bool
    apply_url: str

class FeedResponse(BaseModel):
    jobs: List[JobFeedItem]
    total: int
    page: int

# --- Rank Request ---
class RankJobsRequest(BaseModel):
    resume_id: str
    job_ids: List[str]

# --- Insights Models ---
class TrendingSkillItem(BaseModel):
    skill: str
    job_count: int
    growth_pct: float

class InsightsResponse(BaseModel):
    trending_skills: List[TrendingSkillItem]
    most_requested: List[str]
    role_demand: Dict[str, int]
    avg_salary_by_role: Dict[str, int]
    computed_at: datetime

# --- Hiring Intel Models ---
class HiringRoundItem(BaseModel):
    name: str
    description: str
    tips: List[str]

class HiringIntelResponse(BaseModel):
    role: str
    rounds: List[HiringRoundItem]
    total_rounds: int
    avg_duration_weeks: int
