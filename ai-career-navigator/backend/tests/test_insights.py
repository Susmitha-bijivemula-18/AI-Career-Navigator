# tests/test_insights.py - Unit tests for Phase 3 insight engine calculations
import pytest
from datetime import datetime
from services.insight_engine import compute_insights
from db.collections import INSIGHTS_COLLECTION
from unittest.mock import AsyncMock, MagicMock

@pytest.mark.asyncio
async def test_compute_insights():
    # Setup mock database collections
    mock_db = MagicMock()
    
    # Mock active jobs data
    mock_jobs = [
        {
            "role": "Backend Engineer",
            "required_skills": ["Python", "FastAPI", "Docker"],
            "salary_min": 100000,
            "salary_max": 120000,
            "is_active": True
        },
        {
            "role": "Backend Engineer",
            "required_skills": ["Python", "Django", "SQL"],
            "salary_min": 90000,
            "salary_max": 110000,
            "is_active": True
        },
        {
            "role": "Frontend Engineer",
            "required_skills": ["React", "TypeScript", "CSS"],
            "salary_min": 95000,
            "salary_max": 115000,
            "is_active": True
        }
    ]
    
    # Setup mock jobs collection find().to_list(5000)
    mock_cursor = MagicMock()
    mock_cursor.to_list = AsyncMock(return_value=mock_jobs)
    mock_db.jobs.find = MagicMock(return_value=mock_cursor)
    
    # Mock previous snapshot for trend growth comparison
    # Suppose previously there was 1 job with "python"
    mock_prev_snapshot = {
        "computed_at": datetime.utcnow(),
        "trending_skills": [
            {"skill": "Python", "job_count": 1, "growth_pct": 0.0}
        ]
    }
    
    mock_insights_col = MagicMock()
    # mock find_one for previous snapshot
    mock_insights_col.find_one = AsyncMock(return_value=mock_prev_snapshot)
    mock_insights_col.insert_one = AsyncMock()
    
    # Setup indexing mapping in mock_db
    mock_db.__getitem__.side_effect = lambda key: mock_insights_col if key == INSIGHTS_COLLECTION else mock_db.jobs
    
    # Run target computation function
    result = await compute_insights(mock_db)
    
    # Verification assertions
    assert "computed_at" in result
    assert isinstance(result["computed_at"], datetime)
    
    # Verify top skills are counted correctly
    # Python appeared in 2 jobs, React appeared in 1.
    # Trending skills should contain formatted strings: "Python" and "React"
    trending_map = {item["skill"]: item for item in result["trending_skills"]}
    
    assert "Python" in trending_map
    assert trending_map["Python"]["job_count"] == 2
    # Growth Calculation: (current - prev) / max(prev, 1) * 100
    # Current for Python = 2. Prev = 1. (2 - 1)/1 * 100 = 100.0% growth
    assert trending_map["Python"]["growth_pct"] == 100.0
    
    # Verify role demand count
    assert result["role_demand"]["Backend Engineer"] == 2
    assert result["role_demand"]["Frontend Engineer"] == 1
    
    # Verify average salary calculation:
    # Backend Engineers: min salary values [100000, 90000] -> avg = 95000
    # Frontend Engineer: min salary value [95000] -> avg = 95000
    assert result["avg_salary_by_role"]["Backend Engineer"] == 95000
    assert result["avg_salary_by_role"]["Frontend Engineer"] == 95000
    
    # Verify MongoDB insertion was called
    mock_insights_col.insert_one.assert_called_once()
