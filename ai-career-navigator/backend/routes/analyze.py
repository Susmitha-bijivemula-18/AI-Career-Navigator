# backend/routes/analyze.py - POST /analyze/resume
from fastapi import APIRouter, HTTPException
from models.schemas_v2 import AnalyzeRequest, AnalyzeResponse
from services.llm_client import call_llm_json
from prompts.resume_analysis import SYSTEM_PROMPT_RESUME_ANALYSIS, get_user_prompt_resume_analysis
from services.database import resumes_collection
from datetime import datetime

router = APIRouter()

@router.post("/resume", response_model=AnalyzeResponse)
async def analyze_resume(request: AnalyzeRequest):
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    
    user_prompt = get_user_prompt_resume_analysis(request.resume_text)
    
    fallback = {
        "skills": [],
        "experience_level": "Unknown",
        "predicted_roles": [],
        "summary": "Failed to analyze resume."
    }
    
    result = await call_llm_json(
        system_prompt=SYSTEM_PROMPT_RESUME_ANALYSIS,
        user_prompt=user_prompt,
        model="gpt-4o",
        fallback_default=fallback
    )
    
    # Extract skills using the keyword extractor to augment LLM results (ensuring no casing/missing bugs like Git)
    from services.skill_extractor import extract_skills
    from core.utils import normalize_skill
    
    keyword_skills = extract_skills(request.resume_text)
    llm_skills = result.get("skills", [])
    
    seen_normalized = set()
    combined_skills = []
    
    # Prioritise keyword-extracted skills (preserves original casing from SKILLS_LIST)
    for s in keyword_skills + llm_skills:
        norm = normalize_skill(s)
        if norm and norm not in seen_normalized:
            seen_normalized.add(norm)
            combined_skills.append(s)
            
    result["skills"] = combined_skills
    
    # Optional: Save basic info to resumes collection
    result_insert = await resumes_collection.insert_one({
        "raw_text": request.resume_text,
        "extracted_skills": combined_skills,
        "experience_level": result.get("experience_level", "Unknown"),
        "predicted_roles": result.get("predicted_roles", []),
        "ai_summary": result.get("summary", ""),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    return AnalyzeResponse(
        resume_id=str(result_insert.inserted_id),
        **result
    )
