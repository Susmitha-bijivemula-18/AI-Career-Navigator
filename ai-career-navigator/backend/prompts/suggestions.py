# backend/prompts/suggestions.py - Prompts for Phase 2 Suggestions

SYSTEM_PROMPT_SUGGESTIONS = """You are a senior technical career coach helping a developer improve their resume and skill set.
Respond ONLY with a JSON object. No markdown."""

def get_user_prompt_suggestions(skills: list, experience_level: str, target_roles: list) -> str:
    skills_str = ", ".join(skills)
    roles_str = ", ".join(target_roles)
    
    return f"""Current skills: {skills_str}
Experience level: {experience_level}
Target roles: {roles_str}

Respond with:
{{
  "skills_to_learn": [
    {{ "skill": "...", "priority": 1-5, "reason": "..." }}
  ],
  "project_ideas": [
    {{ "title": "...", "description": "2–3 sentences", "skills_demonstrated": [...] }}
  ],
  "resume_tips": ["tip 1", "tip 2"]
}}"""
