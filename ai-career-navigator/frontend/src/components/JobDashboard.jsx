// src/components/JobDashboard.jsx - Grid layout of JobCard components
import React from 'react';
import JobCard from './JobCard';

export default function JobDashboard({ jobs, isMatched, resumeSkills }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-16 glass-card rounded-2xl max-w-4xl mx-auto border-dashed border-2 border-slate-200 bg-white relative overflow-hidden">
        <div className="relative z-10 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 mb-6 shadow-sm border border-slate-200">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-950 mb-3 tracking-tight">No jobs found</h3>
          <p className="text-base text-slate-600 max-w-sm mx-auto">
            Upload your resume to see personalized matches, or check back later.
          </p>
        </div>
      </div>
    );
  }

  const matchedJobs = isMatched ? jobs.filter(j => (j.match_percentage !== undefined ? j.match_percentage : j.composite_score) > 50) : jobs;
  const notMatchedJobs = isMatched ? jobs.filter(j => (j.match_percentage !== undefined ? j.match_percentage : j.composite_score) <= 50) : [];

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
    
    return Array.from(missing).map(norm => originalNames[norm]).slice(0, 15);
  }, [isMatched, resumeSkills, jobs]);

  return (
    <div className="max-w-7xl mx-auto mt-8">
      {isMatched && globalMissingSkills.length > 0 && (
        <div className="mb-10 glass-card p-6 md:p-7 rounded-2xl border border-accent/20 bg-accent/5 relative overflow-hidden">
          <h3 className="text-lg md:text-xl font-bold text-slate-950 mb-4 flex items-center gap-3">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-accent"></span>
            Critical Skills to Learn Across All Jobs
          </h3>
          <div className="flex flex-wrap gap-2.5 relative z-10">
            {globalMissingSkills.map((skill, i) => (
              <span key={i} className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] shadow-sm cursor-default hover:bg-[#FCA5A5]/20 transition-colors">
                <span className="mr-1.5 text-[#DC2626] font-bold">x</span> {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-7 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-950">
          {isMatched ? 'Jobs Matched (> 50%)' : 'Available Jobs'}
          {isMatched && <span className="relative inline-flex h-3 w-3 rounded-full bg-secondary"></span>}
        </h2>
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white border border-borderLight shadow-sm text-slate-700">
          <span className="text-primary mr-2 font-bold">{matchedJobs.length}</span> roles found
        </span>
      </div>
      
      {matchedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {matchedJobs.map(job => (
            <JobCard key={job.id} job={job} resumeSkills={resumeSkills} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 glass-card rounded-2xl border border-slate-200 bg-white">
          <p className="text-slate-600 font-medium">No jobs matched above 50%.</p>
        </div>
      )}

      {isMatched && notMatchedJobs.length > 0 && (
        <div className="mt-14 pt-9 border-t border-slate-200 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-7 gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-700 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Not Matched (&lt;= 50%)
            </h2>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600">
              {notMatchedJobs.length} roles found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-90">
            {notMatchedJobs.map(job => (
              <JobCard key={job.id} job={job} resumeSkills={resumeSkills} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
