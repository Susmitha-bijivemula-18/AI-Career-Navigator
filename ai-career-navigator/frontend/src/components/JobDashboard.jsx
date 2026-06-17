// src/components/JobDashboard.jsx - Grid layout of JobCard components
import React from 'react';
import JobCard from './JobCard';

export default function JobDashboard({ jobs, isMatched, resumeSkills }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-20 glass-card rounded-[2rem] max-w-4xl mx-auto border-dashed border-2 border-slate-700 bg-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/80 mb-6 shadow-inner border border-slate-700">
            <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-3xl font-extrabold text-white mb-3 tracking-tight">No jobs found</h3>
          <p className="text-lg font-light text-slate-400 max-w-sm mx-auto">
            Upload your resume to see personalized matches, or check back later.
          </p>
        </div>
      </div>
    );
  }

  const matchedJobs = isMatched ? jobs.filter(j => (j.match_percentage !== undefined ? j.match_percentage : j.composite_score) > 50) : jobs;
  const notMatchedJobs = isMatched ? jobs.filter(j => (j.match_percentage !== undefined ? j.match_percentage : j.composite_score) <= 50) : [];

  // Compute global missing skills across all jobs
  const globalMissingSkills = React.useMemo(() => {
    if (!isMatched || !resumeSkills || !jobs) return [];
    const resumeSet = new Set(resumeSkills.map(s => s.toLowerCase().replace(/[^a-z0-9]/g, '')));
    const missing = new Set();
    const originalNames = {};
    
    jobs.forEach(job => {
      if (job.required_skills) {
        job.required_skills.forEach(skill => {
          const norm = skill.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!resumeSet.has(norm)) {
            missing.add(norm);
            if (!originalNames[norm]) originalNames[norm] = skill;
          }
        });
      }
    });
    
    return Array.from(missing).map(norm => originalNames[norm]).slice(0, 15); // Show top 15 missing skills globally
  }, [isMatched, resumeSkills, jobs]);

  return (
    <div className="max-w-7xl mx-auto mt-10">
      {isMatched && globalMissingSkills.length > 0 && (
        <div className="mb-12 glass-card p-6 md:p-8 rounded-2xl border border-red-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>
          <h3 className="text-xl font-extrabold text-white mb-4 flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
            </span>
            Critical Skills to Learn Across All Jobs
          </h3>
          <div className="flex flex-wrap gap-2.5 relative z-10">
            {globalMissingSkills.map((skill, i) => (
              <span key={i} className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-900/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)] cursor-default hover:bg-red-500/20 hover:text-red-300 transition-colors">
                <span className="mr-1.5 text-red-500 font-bold">✗</span> {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between mb-10 px-4 gap-4">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-4 drop-shadow-md">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {isMatched ? 'Jobs Matched (> 50%)' : 'Available Jobs'}
          </span>
          {isMatched && <span className="flex h-4 w-4 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]"></span>
          </span>}
        </h2>
        <span className="inline-flex items-center px-5 py-2 rounded-full text-sm font-bold bg-white/10 border border-white/20 shadow-lg text-slate-200 backdrop-blur-md">
          <span className="text-cyan-400 mr-2 font-black">{matchedJobs.length}</span> roles found
        </span>
      </div>
      
      {matchedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {matchedJobs.map(job => (
            <JobCard key={job.id} job={job} resumeSkills={resumeSkills} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 glass-card rounded-2xl border border-slate-800 bg-white/5">
          <p className="text-slate-400 font-medium">No jobs matched above 50%.</p>
        </div>
      )}

      {isMatched && notMatchedJobs.length > 0 && (
        <div className="mt-16 pt-10 border-t border-white/10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 px-4 gap-4">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-300 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              Not Matched (≤ 50%)
            </h2>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-slate-800 border border-slate-700 text-slate-400">
              {notMatchedJobs.length} roles found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80 hover:opacity-100 transition-opacity duration-300">
            {notMatchedJobs.map(job => (
              <JobCard key={job.id} job={job} resumeSkills={resumeSkills} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
