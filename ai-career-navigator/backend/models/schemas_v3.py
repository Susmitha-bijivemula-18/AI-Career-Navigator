# backend/models/schemas_v3.py - Pydantic v2 models for Phase 3 API responses
from pydantic import BaseModel
from typing import List, Optional, Dict

class JobResponse(BaseModel):
    id: str
    company: str
    role: str
    match_percentage: int
    composite_score: int
    freshness_label: str
    matched_skills: List[str]
    missing_skills: List[str]
    salary_range: Optional[str]
    remote: bool
    apply_url: str

class FeedResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
    page: int

class RankRequest(BaseModel):
    resume_id: str
    job_ids: List[str]

class TrendingSkill(BaseModel):
    skill: str
    job_count: int
    growth_pct: float

class InsightsResponse(BaseModel):
    trending_skills: List[TrendingSkill]
    most_requested: List[str]
    role_demand: Dict[str, int]
    computed_at: str

class HiringRound(BaseModel):
    name: str
    description: str
    tips: List[str]

class HiringIntelResponse(BaseModel):
    role: str
    rounds: List[HiringRound]
    total_rounds: int
    avg_duration_weeks: int

class MatchScore(BaseModel):
    job_id: str
    role: str
    score: int

class AnalyticsResponse(BaseModel):
    skill_distribution: Dict[str, int]
    match_scores: List[MatchScore]
    avg_match_pct: float
    top_missing: List[str]
