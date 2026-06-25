# backend/tests/test_freshness.py - test freshness_label
from datetime import datetime, timedelta
from services.freshness import freshness_label

def test_freshness_just_now():
    now = datetime.utcnow()
    assert freshness_label(now) == "Posted just now"
    
def test_freshness_hours():
    past = datetime.utcnow() - timedelta(hours=3)
    assert freshness_label(past) == "Posted 3 hours ago"

def test_freshness_days():
    past = datetime.utcnow() - timedelta(days=5)
    assert freshness_label(past) == "Posted 5 days ago"
