# backend/prompts/gap_explainer.py - Prompts for Phase 2 Skill Gap Explanation

SYSTEM_PROMPT_GAP_EXPLAINER = """You are a senior engineering hiring manager. 
Explain why each missing skill matters for the given job role.
Respond ONLY with a JSON array."""

def get_user_prompt_gap_explainer(job_role: str, missing_skills_list: list) -> str:
    missing_str = ", ".join(missing_skills_list)
    return f"""Job role: {job_role}
Missing skills: {missing_str}

For each skill, respond with:
[
  {{
    "skill": "...",
    "reason": "1–2 sentences explaining why this skill is important specifically for this {job_role} role."
  }}
]"""
