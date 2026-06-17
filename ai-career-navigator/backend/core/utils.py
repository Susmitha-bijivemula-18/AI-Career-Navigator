# backend/core/utils.py
import re

def normalize_skill(skill: str) -> str:
    """
    Normalizes a skill name to ensure consistent comparison across various formats.
    e.g., 'REST API' -> 'restapi', 'Fast API' -> 'fastapi', 'Git' -> 'git'
    """
    if not skill:
        return ""
    # Lowercase and strip whitespace
    s = skill.lower().strip()
    
    # Remove all characters except lowercase letters, numbers, '#', and '+'
    s = re.sub(r'[^a-z0-9#+]', '', s)
    
    # Exempt technical terms ending in 's' from being trimmed to singular form
    exempt_plurals = {
        'css', 'redis', 'postgres', 'pandas', 'kubernetes', 'aws', 'jenkins', 
        'express', 'nodejs', 'reactjs', 'vuejs', 'analytics', 'statistics', 
        'physics', 'graphics', 'business', 'process', 'rails', 'sass', 'keras',
        'os', 'canvas'
    }
    
    if s.endswith('s') and s not in exempt_plurals:
        s = s[:-1]
        
    return s
