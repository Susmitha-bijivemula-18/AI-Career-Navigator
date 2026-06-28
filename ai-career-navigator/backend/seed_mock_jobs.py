import json
import os
from services.database import supabase
from core.logging import log

def seed_jobs():
    jobs_file = os.path.join(os.path.dirname(__file__), 'data', 'jobs.json')
    try:
        with open(jobs_file, 'r') as f:
            jobs = json.load(f)
            
        print(f"Loaded {len(jobs)} jobs from {jobs_file}")
        
        for job in jobs:
            # We must map the mock data keys to the Supabase jobs table columns
            # Jobs table schema:
            # external_id, source, company_name, role, job_description, skills_required, location, apply_link, company_logo, is_active
            
            from ingestion.normaliser import normalise_job
            from datetime import datetime
            
            raw_job = {
                "source_job_id": str(job.get("id", "")),
                "source": "mock_data",
                "company": job.get("company", "Unknown"),
                "company_logo": job.get("logo_url", ""),
                "role": job.get("role", "Unknown Role"),
                "description_raw": job.get("description", "A great opportunity to join our team!"),
                "required_skills": job.get("required_skills", []),
                "location": job.get("location", "Remote"),
                "apply_url": job.get("apply_url", "https://example.com"),
                "posted_at": datetime.utcnow().isoformat()
            }
            
            job_doc = normalise_job(raw_job)
            if "tags" in job_doc:
                del job_doc["tags"]
            
            # The date strings need to be serialized as strings for Supabase API upsert
            for k in ["posted_at", "fetched_at", "expires_at"]:
                if k in job_doc and hasattr(job_doc[k], "isoformat"):
                    job_doc[k] = job_doc[k].isoformat()
                    
            supabase.table('jobs').upsert(job_doc, on_conflict="external_id").execute()
            print(f"Inserted job: {job_doc['role']}")
            
        print("Successfully seeded jobs table!")
    except Exception as e:
        print(f"Failed to seed jobs: {e}")

if __name__ == '__main__':
    seed_jobs()
