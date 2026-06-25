# backend/services/analytics_service.py - skill distribution + match charts data
from collections import Counter
from datetime import datetime
from services.database import supabase

async def build_analytics(db=None, resume_id: str="", feed_jobs: list=None, resume_skills: list=None):
    # This takes the already assembled feed for this resume
    skill_dist = Counter()
    match_scores = []
    
    missing_counter = Counter()
    
    for job in feed_jobs:
        match_scores.append({
            "job_id": str(job["id"]),
            "role": job["role"],
            "score": job["match_percentage"]
        })
        
        for skill in job.get("matched_skills", []):
            skill_dist[skill] += 1
            
        for skill in job.get("missing_skills", []):
            missing_counter[skill] += 1

    avg_pct = sum(m["score"] for m in match_scores) / max(len(match_scores), 1)
    
    doc = {
        "resume_id": resume_id,
        "snapshot_at": datetime.utcnow(),
        "skill_distribution": dict(skill_dist.most_common(10)),
        "match_scores": match_scores,
        "avg_match_pct": round(avg_pct, 1),
        "top_missing": [s for s, _ in missing_counter.most_common(10)]
    }
    
    # Save to DB
    # supabase doesn't store datetime objects directly, stringify snapshot_at
    doc_copy = doc.copy()
    doc_copy["snapshot_at"] = doc_copy["snapshot_at"].isoformat()
    supabase.table('analytics_snapshots').insert({
        "metrics": doc_copy
    }).execute()
    
    return doc
