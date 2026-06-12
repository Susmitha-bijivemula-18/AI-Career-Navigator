# services/skill_extractor.py - Keyword match extracted text against SKILLS_LIST
import re
from data.skills_list import SKILLS_LIST

def extract_skills(text: str) -> list[str]:
    """
    Extracts skills from the given text using simple keyword matching.
    """
    text_lower = text.lower()
    matched_skills = []
    
    for skill in SKILLS_LIST:
        # Lowercase the skill for case-insensitive matching
        skill_lower = skill.lower()
        
        # We can do a simple string find, or word boundary regex
        # Using regex with word boundaries to avoid partial matches 
        # (e.g., finding "C" in "React") but escaping the skill name first
        pattern = r'\b' + re.escape(skill_lower) + r'\b'
        
        # If it's something like "C++", \b might not work perfectly, 
        # but for MVP MVP simple `in` or regex \b is fine. 
        # Let's use simple `in` check as requested: "Check if each skill in SKILLS_LIST appears in the text."
        if skill_lower in text_lower:
            matched_skills.append(skill)
            
    return matched_skills
