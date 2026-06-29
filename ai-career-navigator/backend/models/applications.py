from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class ApplicationBase(BaseModel):
    job_id: UUID
    status: str = "Saved"
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None

class ApplicationTimelineEntry(BaseModel):
    id: UUID
    application_id: UUID
    old_status: Optional[str] = None
    new_status: str
    changed_at: datetime

class JobSummary(BaseModel):
    id: UUID
    company_name: str
    company_logo: Optional[str] = None
    role: str
    location: Optional[str] = None
    job_apply_link: Optional[str] = None

class ApplicationOut(BaseModel):
    id: UUID
    user_id: UUID
    job_id: UUID
    status: str
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None
    updated_at: datetime
    jobs: Optional[JobSummary] = None
    application_timeline: Optional[List[ApplicationTimelineEntry]] = None

class DashboardStats(BaseModel):
    total_applications: int
    under_review: int
    interviews_scheduled: int
    offers_received: int
    rejected: int
    status_distribution: dict
    applications_per_month: dict
