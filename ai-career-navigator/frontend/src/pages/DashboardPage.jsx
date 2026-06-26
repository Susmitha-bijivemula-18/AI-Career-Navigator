import React, { useState } from 'react';
import ResumeUploadCard from '../components/dashboard/ResumeUploadCard';
import ResumeSummaryCard from '../components/dashboard/ResumeSummaryCard';
import ParsedSkillsCard from '../components/dashboard/ParsedSkillsCard';
import RecommendedJobs from '../components/dashboard/RecommendedJobs';
import ImprovementSuggestions from '../components/dashboard/ImprovementSuggestions';
import { uploadResume, fetchJobMatches } from '../api/client';
import { aiClient } from '../api/aiClient';
import { IconChartPie, IconTargetArrow, IconBriefcase, IconTrendingUp } from '@tabler/icons-react';

export default function DashboardPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 1 & 2: POST /upload/resume
      const uploadData = await uploadResume(file);
      const extractedSkills = uploadData.extracted_skills || [];
      const text = uploadData.resume_text || '';
      
      // 3. GET /jobs/match?skills=...
      const matchedJobs = await fetchJobMatches(extractedSkills);
      setJobs(matchedJobs || []);
      
      // 4. POST /analyze/resume
      const aiAnalysis = await aiClient.analyzeResume(text);
      aiAnalysis.skills = extractedSkills;
      setAnalysis(aiAnalysis);
      
      // Fetch recommendations
      let recs = null;
      if (aiAnalysis.resume_id) {
        recs = await aiClient.getRecommendations(aiAnalysis.resume_id);
        setRecommendations(recs);
      }
      
      // 5. POST /suggest
      const aiSuggestions = await aiClient.getSuggestions(
        extractedSkills,
        aiAnalysis.experience_level || 'Mid Level',
        aiAnalysis.predicted_roles || []
      );
      setSuggestions(aiSuggestions);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { label: "Match Score", value: analysis ? "85%" : "--", icon: <IconChartPie className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
    { label: "Target Roles", value: analysis?.predicted_roles?.length || "--", icon: <IconTargetArrow className="w-5 h-5 text-violet-500" /> },
    { label: "Matched Jobs", value: jobs?.length || "--", icon: <IconBriefcase className="w-5 h-5 text-indigo-500" /> },
    { label: "Skill Gap", value: recommendations?.missing_skills?.length || "--", icon: <IconTrendingUp className="w-5 h-5 text-violet-500" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] p-4 md:p-8 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Upload your resume to get AI-powered insights</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        {/* 4-column stat strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                {metric.icon}
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{metric.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2-column row: ResumeUploadCard | ResumeSummaryCard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResumeUploadCard 
            onUpload={handleUpload} 
            isLoading={loading} 
            file={file} 
            setFile={setFile} 
          />
          <ResumeSummaryCard 
            analysis={analysis} 
            isLoading={loading} 
          />
        </div>

        {/* 2-column row: ParsedSkillsCard | RecommendedJobs */}
        {(analysis || loading) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ParsedSkillsCard 
              analysis={analysis} 
              recommendations={recommendations}
              isLoading={loading} 
            />
            <RecommendedJobs 
              jobs={jobs} 
              isLoading={loading} 
            />
          </div>
        )}

        {/* Full-width: ImprovementSuggestions */}
        {(suggestions || loading) && (
          <ImprovementSuggestions 
            suggestions={suggestions} 
            isLoading={loading} 
          />
        )}

      </div>
    </div>
  );
}
