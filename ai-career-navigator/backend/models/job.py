from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class JobBase(BaseModel):
    company_name: Optional[str] = None
    company: Optional[str] = None
    role: str
    job_description: Optional[str] = None
    description_raw: Optional[str] = None
    skills_required: Optional[List[str]] = []
    required_skills: Optional[List[str]] = []
    location: Optional[str] = None
    job_apply_link: Optional[str] = None
    company_careers_link: Optional[str] = None
    company_logo: Optional[str] = None
    source: str
    external_id: str

class JobCreate(JobBase):
    posted_time: Optional[datetime] = None

class JobResponse(JobBase):
    id: UUID
    posted_time: Optional[datetime] = None
    posted_at: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
