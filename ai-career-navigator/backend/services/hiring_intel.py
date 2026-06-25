# backend/services/hiring_intel.py - interview rounds + prep tips via LLM
import json
import httpx
from datetime import datetime
from core.config import settings
from services.database import supabase

SYSTEM_PROMPT = """You are a senior engineering hiring manager with 15+ years of experience.
Return ONLY a JSON object. No markdown. No explanation."""

USER_PROMPT_TEMPLATE = """Job role: {role}

Return the typical hiring process for this role:
{{
  "rounds": [
    {{
      "name": "round name",
      "description": "1-2 sentences about this round",
      "tips": ["tip 1", "tip 2", "tip 3"]
    }}
  ],
  "total_rounds": N,
  "avg_duration_weeks": N
}}
Include 4-6 rounds. Tips must be specific to this exact role."""

async def get_hiring_intel(db=None, role: str=""):
    # Check DB first
    response = supabase.table('hiring_intel').select('*').eq('role', role).execute()
    existing = response.data[0] if response.data else None
    if existing:
        return existing.get('intel_data', {})

    # Call LLM
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": USER_PROMPT_TEMPLATE.format(role=role)}
        ],
        "response_format": {"type": "json_object"}
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=data, timeout=30.0)
        resp.raise_for_status()
        result_text = resp.json()["choices"][0]["message"]["content"]

    intel_data = json.loads(result_text)
    doc = {
        "role": role,
        "rounds": intel_data.get("rounds", []),
        "total_rounds": intel_data.get("total_rounds", 0),
        "avg_duration_weeks": intel_data.get("avg_duration_weeks", 0),
        "generated_at": datetime.utcnow(),
        "source": "llm"
    }

    supabase.table('hiring_intel').insert({
        "role": role,
        "intel_data": doc
    }).execute()
    return doc
