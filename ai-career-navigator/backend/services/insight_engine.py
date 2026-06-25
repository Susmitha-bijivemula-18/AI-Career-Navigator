# backend/services/insight_engine.py - computes trending skills + market demand
from collections import Counter, defaultdict
from datetime import datetime
from services.database import supabase

async def compute_insights(db=None):
    response = supabase.table('jobs').select('*').eq('is_active', True).execute()
    jobs = response.data if response.data else []

    skill_counter = Counter()
    role_counter  = Counter()
    salary_by_role = defaultdict(list)

    for job in jobs:
        for skill in job.get("required_skills", []):
            skill_counter[skill.lower()] += 1
        role_counter[job.get("role","unknown")] += 1
        if job.get("salary_min"):
            salary_by_role[job["role"]].append(job["salary_min"])

    # Growth % = compare with previous insights snapshot
    prev_resp = supabase.table('insights').select('insight_data').order('created_at', desc=True).limit(1).execute()
    prev = prev_resp.data[0]['insight_data'] if prev_resp.data else {}
    prev_counts = {s["skill"]: s["job_count"] 
                   for s in prev.get("trending_skills", [])}

    trending = []
    for skill, count in skill_counter.most_common(30):
        prev_c = prev_counts.get(skill, count)
        growth = round(((count - prev_c) / max(prev_c, 1)) * 100, 1)
        trending.append({"skill": skill, "job_count": count,
                         "growth_pct": growth})

    doc = {
        "computed_at": datetime.utcnow(),
        "trending_skills": trending,
        "most_requested": [s for s,_ in skill_counter.most_common(20)],
        "role_demand": dict(role_counter),
        "avg_salary_by_role": {
            role: round(sum(vals)/len(vals))
            for role, vals in salary_by_role.items() if vals
        }
    }
    supabase.table('insights').insert({
        "query": "global",
        "insight_data": doc
    }).execute()
    return doc
