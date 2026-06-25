import React, { useState, useEffect } from 'react';
import ResumeUpload from './components/ResumeUpload';
import JobDashboard from './components/JobDashboard';
import Phase2Dashboard from './components/Phase2Dashboard';
import { fetchJobs } from './api/client';

function App() {
  const [jobs, setJobs] = useState([]);
  const [isMatched, setIsMatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Phase 2 State
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [suggestions, setSuggestions] = useState(null);

  const loadAllJobs = async () => {
    setLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
      setIsMatched(false);
      setError(null);
      
      // Reset Phase 2 states
      setAnalysis(null);
      setRecommendations(null);
      setSuggestions(null);
    } catch (err) {
      setError("Failed to load available jobs. Ensure backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllJobs();
  }, []);

  const handleUploadComplete = (data) => {
    setAnalysis(data.analysis);
    setRecommendations(data.recommendations);
    setSuggestions(data.suggestions);
    
    // Convert top_jobs to the format JobDashboard expects
    if (data.recommendations && data.recommendations.top_jobs) {
      setJobs(prevJobs => {
        const mappedJobs = data.recommendations.top_jobs.map(job => {
          const originalJob = prevJobs.find(j => j.id.toString() === job.job_id.toString());
          return {
            id: job.job_id,
            role: job.role,
            company: job.company,
            apply_url: job.apply_url,
            match_percentage: job.match_percentage !== undefined ? job.match_percentage : job.composite_score, // Fallback if backend not restarted
            composite_score: job.composite_score,
            reason: job.reason,
            required_skills: originalJob?.required_skills || []
          };
        });
        return mappedJobs;
      });
      setIsMatched(true);
    }
  };

  return (
    <div className="min-h-screen bg-bgLight py-0 overflow-x-hidden font-sans text-textMain">
      {/* Hero Banner Section */}
      <div className="hero-gradient pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative rounded-b-[40px] shadow-md mb-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-b-[40px]">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary opacity-30 rounded-full blur-3xl"></div>
          <div className="absolute top-12 right-0 w-80 h-80 bg-primary opacity-40 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <header className="max-w-7xl mx-auto text-center animate-fadeIn">
            <div className="inline-flex mb-6 px-5 py-2 rounded-full bg-white/20 border border-white/30 backdrop-blur-md shadow-sm">
              <span className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                AI-Powered Recruiting
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 pb-1 drop-shadow-sm">
              AI Career Navigator
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-8">
              Upload your resume and let our intelligent engine instantly match your skills with the perfect opportunities.
            </p>
          </header>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <main className="max-w-7xl mx-auto space-y-8 md:space-y-12 relative -mt-20">
          <ResumeUpload 
            onUploadComplete={handleUploadComplete} 
            onJobsReset={loadAllJobs} 
          />
          
          {error && (
            <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 p-5 rounded-2xl shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!error && isMatched && analysis && (
            <div className="animate-fadeIn space-y-10">
              <Phase2Dashboard 
                resumeText={analysis.raw_text} 
                initialAnalysis={analysis} 
                initialRecommendations={recommendations}
                onReanalyze={() => {
                  setIsMatched(false);
                  setAnalysis(null);
                }}
              />
              <JobDashboard 
                jobs={jobs} 
                isMatched={isMatched} 
                resumeSkills={analysis.skills} 
              />
            </div>
          )}

          {!error && !isMatched && !loading && (
            <JobDashboard jobs={jobs} isMatched={isMatched} />
          )}

        </main>
      </div>
    </div>
  );
}

export default App;
