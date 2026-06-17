# backend/prompts/resume_analysis.py - Prompts for Phase 1/Phase 2 Resume Extraction

SYSTEM_PROMPT_RESUME_ANALYSIS = """You are an expert technical recruiter and career coach.
Analyse the resume text and respond ONLY with a JSON object.
No markdown, no explanation — raw JSON only."""

def get_user_prompt_resume_analysis(resume_text: str) -> str:
    return f"""Resume text:
\"\"\"
{resume_text}
\"\"\"

Respond with this exact JSON structure:
{{
  "skills": [list of technical skills found],
  "experience_level": "Junior" | "Mid" | "Senior",
  "predicted_roles": [exactly 3 suitable job role titles],
  "summary": "2–3 sentence professional summary"
}}"""
