# backend/services/freshness.py - Converts posting date into descriptive text
from datetime import datetime

def freshness_label(posted_at: datetime) -> str:
    """
    Computes a friendly label explaining how long ago the job was posted.
    """
    delta = datetime.utcnow() - posted_at
    minutes = delta.total_seconds() / 60
    if minutes < 5:
        return "Posted just now"
    if minutes < 60:
        return f"Posted {int(minutes)} minutes ago"
    
    hours = minutes / 60
    if hours < 24:
        return f"Posted {int(hours)} hours ago"
        
    days = hours / 24
    if days < 7:
        return f"Posted {int(days)} days ago"
        
    weeks = days / 7
    if weeks < 4:
        return f"Posted {int(weeks)} weeks ago"
        
    return "Posted over a month ago"
