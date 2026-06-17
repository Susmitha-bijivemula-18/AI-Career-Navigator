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
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-slate-200">
      {/* Dynamic ambient background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="relative z-10">
        <header className="max-w-7xl mx-auto mb-16 text-center animate-fadeIn">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-md">
            <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulseGlow"></span>
              AI-Powered Recruiting
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 tracking-tight mb-6 pb-2 drop-shadow-sm">
            AI Career Navigator
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Upload your resume and let our intelligent engine instantly match your skills with the perfect opportunities.
          </p>
        </header>

        <main className="max-w-7xl mx-auto space-y-10 relative">
          <ResumeUpload 
            onUploadComplete={handleUploadComplete} 
            onJobsReset={loadAllJobs} 
          />
          
          {error && (
            <div className="max-w-3xl mx-auto bg-red-50/90 backdrop-blur-sm border-l-4 border-red-500 p-5 rounded-r-xl shadow-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-bold text-red-800">{error}</p>
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
