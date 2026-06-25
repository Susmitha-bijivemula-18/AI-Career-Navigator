# backend/cache/cache_keys.py - centralised key constants + TTL values
KEYS = {
    "feed":      lambda rid:  f"feed:{rid}",
    "insights":  lambda: "insights:latest",
    "hiring":    lambda role: f"hiring:{role.lower().replace(' ', '-')}",
    "analytics": lambda rid:  f"analytics:{rid}",
}

TTL = {
    "feed":      900,    # 15 minutes
    "insights":  3600,   # 1 hour
    "hiring":    86400,  # 24 hours
    "analytics": 1800,   # 30 minutes
}
