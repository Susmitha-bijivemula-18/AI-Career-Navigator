# tests/test_ingestion.py - Unit tests for Phase 3 job ingestion, normalization, and fetchers
import pytest
from datetime import datetime, timedelta, timezone
from ingestion.base_fetcher import RawJob
from ingestion.normaliser import parse_date, detect_experience_level, normalise_job
from ingestion.rss_fetcher import RSSFetcher
from unittest.mock import AsyncMock, MagicMock, patch

def test_parse_date():
    # 1. Test numeric timestamp (epoch seconds string)
    dt_epoch = parse_date("1718272800")
    assert dt_epoch.year == 2024
    assert dt_epoch.month == 6
    assert dt_epoch.day == 13

    # 2. Test standard ISO format
    dt_iso = parse_date("2026-06-13T10:00:00Z")
    assert dt_iso.year == 2026
    assert dt_iso.month == 6
    assert dt_iso.day == 13
    assert dt_iso.hour == 10

    # 3. Test RFC 822 format (e.g. RSS feed format)
    dt_rss = parse_date("Thu, 13 Jun 2026 10:00:00 +0000")
    assert dt_rss.year == 2026
    assert dt_rss.month == 6
    assert dt_rss.day == 13
    assert dt_rss.hour == 10

def test_detect_experience_level():
    assert detect_experience_level("Senior Python Engineer", "Looking for a seasoned architect.") == "Senior"
    assert detect_experience_level("Software Engineer II", "We need a mid level developer.") == "Mid"
    assert detect_experience_level("Junior Developer", "Entry level role for graduates.") == "Junior"
    assert detect_experience_level("Lead React Dev", "Lead frontend developer position.") == "Senior"
    assert detect_experience_level("Associate QA Analyst", "Internship or graduate level.") == "Junior"

def test_normalise_job():
    raw = RawJob(
        source_job_id="12345",
        source_name="remoteok",
        company="Test Company",
        role="Senior Python Engineer",
        location="Remote",
        remote=True,
        salary_min=100000,
        salary_max=120000,
        apply_url="https://example.com/apply",
        posted_at_raw="2026-06-13T10:00:00Z",
        description_raw="We need Python and Docker expertise. Experience with FastAPI is a plus.",
        tags=["python", "docker"]
    )
    
    doc = normalise_job(raw)
    
    assert doc.external_id == "remoteok:12345"
    assert doc.source == "remoteok"
    assert doc.company == "Test Company"
    assert doc.role == "Senior Python Engineer"
    assert doc.experience_level == "Senior"
    assert doc.salary_min == 100000
    assert doc.salary_max == 120000
    
    # Skills check using the extract_skills function on description_raw
    # Python, Docker should be extracted if they are in data/skills_list
    assert "Python" in doc.required_skills
    assert "Docker" in doc.required_skills
    
    # Expiry calculation: expires_at must be fetched_at + 30 days
    delta = doc.expires_at - doc.fetched_at
    assert abs(delta.total_seconds() - timedelta(days=30).total_seconds()) < 10

@pytest.mark.asyncio
async def test_rss_fetcher_filtering():
    fetcher = RSSFetcher(feed_url="https://mockfeed.xml", source_name="mock_rss")
    
    # Mock XML response with RSS feed items
    mock_xml = """<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
    <channel>
        <title>Mock Jobs Feed</title>
        <link>http://example.com</link>
        <description>Mock programming jobs</description>
        <item>
            <title>Stripe: Senior Python Developer</title>
            <link>https://example.com/job1</link>
            <guid>stripe-job-1</guid>
            <description>Looking for a Senior Python Developer with FastAPI experience.</description>
            <pubDate>Thu, 13 Jun 2026 10:00:00 +0000</pubDate>
        </item>
        <item>
            <title>Github: React Developer</title>
            <link>https://example.com/job2</link>
            <guid>github-job-2</guid>
            <description>Looking for a React developer focused on frontend systems.</description>
            <pubDate>Fri, 14 Jun 2026 10:00:00 +0000</pubDate>
        </item>
    </channel>
    </rss>
    """
    
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = mock_xml
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response
        
        # Test filtering by keyword Python
        jobs = await fetcher.fetch(keywords=["python"], location="Remote")
        
        assert len(jobs) == 1
        assert jobs[0].company == "Stripe"
        assert jobs[0].role == "Senior Python Developer"
        assert jobs[0].apply_url == "https://example.com/job1"
        assert "stripe-job-1" in jobs[0].source_job_id
