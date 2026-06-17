# tests/test_freshness.py - Unit tests for job posting date formatting labels
from datetime import datetime, timedelta
from services.freshness import freshness_label

def test_freshness_label_just_now():
    now = datetime.utcnow()
    assert freshness_label(now) == "Posted just now"
    assert freshness_label(now - timedelta(minutes=4)) == "Posted just now"

def test_freshness_label_minutes():
    now = datetime.utcnow()
    assert freshness_label(now - timedelta(minutes=10)) == "Posted 10 minutes ago"
    assert freshness_label(now - timedelta(minutes=59)) == "Posted 59 minutes ago"

def test_freshness_label_hours():
    now = datetime.utcnow()
    assert freshness_label(now - timedelta(hours=1)) == "Posted 1 hours ago"
    assert freshness_label(now - timedelta(hours=23)) == "Posted 23 hours ago"

def test_freshness_label_days():
    now = datetime.utcnow()
    assert freshness_label(now - timedelta(days=1)) == "Posted 1 days ago"
    assert freshness_label(now - timedelta(days=6)) == "Posted 6 days ago"

def test_freshness_label_weeks():
    now = datetime.utcnow()
    assert freshness_label(now - timedelta(days=7)) == "Posted 1 weeks ago"
    assert freshness_label(now - timedelta(days=27)) == "Posted 3 weeks ago"

def test_freshness_label_over_a_month():
    now = datetime.utcnow()
    assert freshness_label(now - timedelta(days=30)) == "Posted over a month ago"
    assert freshness_label(now - timedelta(days=100)) == "Posted over a month ago"
