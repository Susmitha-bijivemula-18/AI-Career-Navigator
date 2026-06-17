# backend/services/hiring_intel.py - Generates role-based hiring process and tips
import json
from datetime import datetime, timedelta
from openai import AsyncOpenAI
from services.database import db
from db.collections import HIRING_INTEL_COLLECTION
from core.config import settings
from core.logging import logger

async def get_hiring_intel(role: str) -> dict:
    """
    Retrieves typical hiring round insights and tips for a given role.
    Utilises MongoDB caching, falling back to OpenAI LLM if stale/missing.
    """
    hiring_intel_col = db[HIRING_INTEL_COLLECTION]
    normalized_role = role.strip()
    
    # 1. Try fetching from cache/DB first (case-insensitive regex match)
    doc = await hiring_intel_col.find_one({"role": {"$regex": f"^{normalized_role}$", "$options": "i"}})
    
    now = datetime.utcnow()
    if doc:
        generated_at = doc.get("generated_at")
        # Ensure it was generated in the last 7 days
        if generated_at and (now - generated_at < timedelta(days=7)):
            logger.info("hiring_intel_cache_hit", role=normalized_role)
            # Make response compatible by stripping DB fields
            doc.pop("_id", None)
            return doc
        logger.info("hiring_intel_cache_expired", role=normalized_role)

    # 2. Call OpenAI LLM
    logger.info("hiring_intel_cache_miss_fetching_llm", role=normalized_role)
    system_prompt = (
        "You are a senior engineering hiring manager with 15+ years of experience.\n"
        "Return ONLY a JSON object. No markdown. No explanation."
    )
    user_prompt = (
        f"Job role: {normalized_role}\n\n"
        "Return the typical hiring process for this role:\n"
        "{\n"
        '  "rounds": [\n'
        "    {\n"
        '      "name": "round name",\n'
        '      "description": "1–2 sentences about this round",\n'
        '      "tips": ["tip 1", "tip 2", "tip 3"]\n'
        "    }\n"
        "  ],\n"
        '  "total_rounds": N,\n'
        '  "avg_duration_weeks": N\n'
        "}\n"
        "Include 4–6 rounds. Tips must be specific to this exact role."
    )

    # Fallback mock template in case of failure or missing API key
    fallback_intel = {
        "role": normalized_role,
        "rounds": [
            {
                "name": "Recruiter Screen",
                "description": "A 30-minute introductory call covering your career history, expectations, and culture fit.",
                "tips": [
                    "Summarise your work history under 2 minutes.",
                    "Research the company's core values.",
                    "Align your salary expectations to market rates."
                ]
            },
            {
                "name": "Technical Assessment",
                "description": "A coding challenge, take-home project, or technical quiz mapping key competencies.",
                "tips": [
                    "Explain your design decisions in comments/docstrings.",
                    "Ensure tests are written and pass successfully.",
                    "Prioritise readability and efficiency."
                ]
            },
            {
                "name": "System Design & Architecture",
                "description": "An interactive whiteboard session covering database choices, scaling strategies, and API contracts.",
                "tips": [
                    "Define scalability parameters (queries per second, storage).",
                    "Choose SQL or NoSQL based on data relational needs.",
                    "Leverage caching (Redis) and message queues (Kafka) where relevant."
                ]
            },
            {
                "name": "Hiring Manager / Culture Fit Screen",
                "description": "A behavioural interview verifying leadership qualities, communication skills, and collaboration models.",
                "tips": [
                    "Structure answers using the STAR format (Situation, Task, Action, Result).",
                    "Highlight team ownership and project leadership moments.",
                    "Prepare 2-3 thoughtful engineering process questions."
                ]
            }
        ],
        "total_rounds": 4,
        "avg_duration_weeks": 4,
        "generated_at": now,
        "source": "mock"
    }

    if not settings.OPENAI_API_KEY:
        logger.warning("hiring_intel_openai_key_missing", role=normalized_role)
        # Store mock in database
        await hiring_intel_col.update_one(
            {"role": normalized_role},
            {"$set": fallback_intel},
            upsert=True
        )
        return fallback_intel

    try:
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            timeout=25.0
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        
        # Hydrate document fields
        data["role"] = normalized_role
        data["generated_at"] = now
        data["source"] = "llm"
        
        # Cache to MongoDB
        await hiring_intel_col.update_one(
            {"role": normalized_role},
            {"$set": data},
            upsert=True
        )
        return data
    except Exception as e:
        logger.error("hiring_intel_llm_generation_failed", role=normalized_role, error=str(e))
        fallback_intel["source"] = "fallback"
        await hiring_intel_col.update_one(
            {"role": normalized_role},
            {"$set": fallback_intel},
            upsert=True
        )
        return fallback_intel
