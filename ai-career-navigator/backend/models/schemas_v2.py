# backend/models/schemas_v2.py - Pydantic models for Phase 2 endpoints
from pydantic import BaseModel
from typing import List, Optional

class AnalyzeRequest(BaseModel):
    resume_text: str

class AnalyzeResponse(BaseModel):
    resume_id: str
    skills: List[str]
    experience_level: str
    predicted_roles: List[str]
    summary: str

class MissingSkill(BaseModel):
    skill: str
    reason: str

class GapAnalysisRequest(BaseModel):
    resume_skills: List[str]
    job_id: str

class GapAnalysisResponse(BaseModel):
    job_id: str
    matched_skills: List[str]
    missing_skills: List[MissingSkill]
    match_percentage: int

class SkillToLearn(BaseModel):
    skill: str
    priority: int
    reason: str

class ProjectIdea(BaseModel):
    title: str
    description: str
    skills_demonstrated: List[str]

class SuggestRequest(BaseModel):
    resume_skills: List[str]
    experience_level: str
    target_roles: List[str]

class SuggestResponse(BaseModel):
    skills_to_learn: List[SkillToLearn]
    project_ideas: List[ProjectIdea]
    resume_tips: List[str]

class SimulateRequest(BaseModel):
    job_id: str
    current_skills: List[str]
    skills_to_add: List[str]

class SimulateResponse(BaseModel):
    job_id: str
    current_match: int
    simulated_match: int
    delta: int
    newly_matched_skills: List[str]

class StrengthItem(BaseModel):
    skill: str
    count: int

class WeaknessItem(BaseModel):
    skill: str
    missing_count: int

class Dashboard(BaseModel):
    strengths: List[StrengthItem]
    weaknesses: List[WeaknessItem]
    learning_path: List[str]

class RecommendedJob(BaseModel):
    job_id: str
    company: str
    role: str
    match_percentage: int
    composite_score: int
    reason: str
    job_apply_link: Optional[str] = None
    company_careers_link: Optional[str] = None

class RecommendResponse(BaseModel):
    top_jobs: List[RecommendedJob]
    dashboard: Dashboard
