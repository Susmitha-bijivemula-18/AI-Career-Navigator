# backend/prompts/learning_path.py - Prompts for Phase 2 Learning Path

SYSTEM_PROMPT_LEARNING_PATH = """You are a technical career strategist.
Given a developer's skills and target roles, generate a prioritised learning path to maximise their employability.
Respond ONLY with a JSON array of skill names in order."""

def get_user_prompt_learning_path(skills: list, weaknesses: list, target_roles: list) -> str:
    skills_str = ", ".join(skills)
    weaknesses_str = ", ".join(weaknesses)
    roles_str = ", ".join(target_roles)
    
    return f"""Current skills: {skills_str}
Weak areas (missing from most jobs): {weaknesses_str}
Target roles: {roles_str}

Return:
["skill1", "skill2", "skill3", ...]
(ordered from highest to lowest career impact)"""
