# backend/routes/suggest.py - POST /suggest
from fastapi import APIRouter
from models.schemas_v2 import SuggestRequest, SuggestResponse
from services.llm_client import call_llm_json
from prompts.suggestions import SYSTEM_PROMPT_SUGGESTIONS, get_user_prompt_suggestions

router = APIRouter()

@router.post("", response_model=SuggestResponse)
async def get_suggestions(request: SuggestRequest):
    user_prompt = get_user_prompt_suggestions(
        request.resume_skills, 
        request.experience_level, 
        request.target_roles
    )
    
    fallback = {
        "skills_to_learn": [],
        "project_ideas": [],
        "resume_tips": ["Keep your resume updated."]
    }
    
    result = await call_llm_json(
        system_prompt=SYSTEM_PROMPT_SUGGESTIONS,
        user_prompt=user_prompt,
        model="gpt-4o",
        fallback_default=fallback
    )
    
    return SuggestResponse(**result)
