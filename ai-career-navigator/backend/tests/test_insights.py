# backend/tests/test_insights.py - test insight computation
import pytest
from unittest.mock import patch, MagicMock
from services.insight_engine import compute_insights

@pytest.mark.asyncio
async def test_compute_insights():
    with patch('services.insight_engine.supabase') as mock_supabase:
        # Mock jobs response
        mock_jobs_response = MagicMock()
        mock_jobs_response.data = [
            {"is_active": True, "required_skills": ["python", "docker"], "role": "Backend Engineer"},
            {"is_active": True, "required_skills": ["python", "aws"], "role": "Backend Engineer"}
        ]
        
        # Mock insights response (for growth calculation)
        mock_insights_response = MagicMock()
        mock_insights_response.data = []
        
        # Setup mock chain
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_jobs_response
        mock_supabase.table.return_value.select.return_value.order.return_value.limit.return_value.execute.return_value = mock_insights_response
        
        doc = await compute_insights()
        
        assert doc["role_demand"]["Backend Engineer"] == 2
        assert "python" in doc["most_requested"]
