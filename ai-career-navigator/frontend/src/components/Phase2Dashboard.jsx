// frontend/src/components/Phase2Dashboard.jsx
import React, { useState, useEffect } from 'react';
import ProfileHeader from './ProfileHeader';
import StatStrip from './StatStrip';
import SkillGapPanel from './SkillGapPanel';
import { getGapAnalysis } from '../api/aiClient';

export default function Phase2Dashboard({ resumeText, initialAnalysis, initialRecommendations, onReanalyze }) {
  const [analysis, setAnalysis] = useState(initialAnalysis || null);
  const [targetJob, setTargetJob] = useState(null);

  const [gapData, setGapData] = useState(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [gapError, setGapError] = useState(null);

  // Parse Initial Analysis and Recommendations to set default job
  useEffect(() => {
    if (initialRecommendations && initialRecommendations.top_jobs && initialRecommendations.top_jobs.length > 0) {
      const topJob = initialRecommendations.top_jobs[0];
      setTargetJob({
        id: topJob.job_id,
        company: topJob.company,
        role: topJob.role,
        apply_url: topJob.apply_url,
        match_percentage: topJob.match_percentage !== undefined ? topJob.match_percentage : topJob.composite_score
      });
    }
  }, [initialRecommendations]);

  const handleJobChange = (jobId) => {
    const selectedJob = initialRecommendations?.top_jobs?.find(j => j.job_id === jobId);
    if (selectedJob) {
      setTargetJob({
        id: selectedJob.job_id,
        company: selectedJob.company,
        role: selectedJob.role,
        apply_url: selectedJob.apply_url,
        match_percentage: selectedJob.match_percentage !== undefined ? selectedJob.match_percentage : selectedJob.composite_score
      });
      // Clear data to trigger refetch for the new job
      setGapData(null);
    }
  };

  const loadGapAnalysis = async () => {
    if (!analysis?.skills || !targetJob?.id) return;
    setGapLoading(true);
    setGapError(null);
    try {
      const data = await getGapAnalysis(analysis.skills, targetJob.id);
      setGapData(data);
    } catch (err) {
      setGapError("Failed to load skill gap analysis.");
    } finally {
      setGapLoading(false);
    }
  };

  // Auto-fetch gap analysis when targetJob changes
  useEffect(() => {
    if (!gapData && !gapLoading && targetJob) {
      loadGapAnalysis();
    }
  }, [targetJob, analysis, gapData, gapLoading]);

  // Compute average match percentage across all recommended jobs
  const averageMatch = React.useMemo(() => {
    if (!initialRecommendations || !initialRecommendations.top_jobs || initialRecommendations.top_jobs.length === 0) return 0;
    const allMatches = initialRecommendations.top_jobs.map(j => j.match_percentage !== undefined ? j.match_percentage : j.composite_score);
    return Math.round(allMatches.reduce((a, b) => a + b, 0) / allMatches.length);
  }, [initialRecommendations]);

  return (
    <div className="w-full">
      <ProfileHeader 
        userName="Applicant" 
        experienceLevel={analysis?.experience_level || "Unknown"} 
        onReanalyze={onReanalyze} 
      />
      
      <StatStrip 
        matchPercentage={averageMatch} 
        jobsMatched={initialRecommendations?.top_jobs?.length || 0} 
        skillsFound={analysis?.skills?.length || 0} 
        skillsToLearn={gapData?.missing_skills_with_reasons?.length || gapData?.missing_skills?.length || 0} 
      />
      
      <div className="mt-6">
        <SkillGapPanel 
          loading={gapLoading}
          error={gapError}
          onRetry={loadGapAnalysis}
          job={targetJob}
          matched_skills={gapData?.matched_skills || []}
          missing_skills={gapData?.missing_skills || []}
          match_percentage={targetJob?.match_percentage || 0}
        />
      </div>
    </div>
  );
}
