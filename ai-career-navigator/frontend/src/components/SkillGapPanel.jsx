// frontend/src/components/SkillGapPanel.jsx
import React from 'react';

export default function SkillGapPanel({ loading, error, onRetry, job, matched_skills = [], missing_skills = [], match_percentage = 0 }) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 mt-5 animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-1/3 mb-5"></div>
        <div className="h-2 bg-slate-100 rounded-full mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-slate-100 rounded-xl"></div>
          <div className="h-32 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 mt-5 flex flex-col items-center justify-center text-center border-red-200 bg-red-50">
        <svg className="w-8 h-8 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p className="text-sm font-medium text-red-700 mb-5">{error}</p>
        <button onClick={onRetry} className="px-5 py-2 rounded-xl text-sm font-bold border border-red-200 text-red-700 bg-white hover:bg-red-50 transition-colors">Retry Analysis</button>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const getMatchColor = (pct) => {
    if (pct >= 70) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (pct >= 40) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const getBarColor = (pct) => {
    if (pct >= 70) return 'bg-emerald-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 mt-5 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-5 gap-4">
          <h2 className="text-sm font-bold text-slate-950 flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
            <span className="truncate">{job.company}</span>
            <span className="text-slate-300 font-light px-1">|</span>
            <span className="text-teal-700 truncate">{job.role}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${getMatchColor(match_percentage)}`}>
              {match_percentage}% Match
            </span>
            <a 
              href={job.apply_url || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full bg-slate-950 text-white hover:bg-teal-700 transition-all shadow-sm"
            >
              Apply Now
            </a>
          </div>
        </div>
        
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-8 border border-slate-200">
          <div className={`h-full rounded-full transition-all duration-1000 ${getBarColor(match_percentage)}`} style={{ width: `${match_percentage}%` }}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Matched Skills
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {matched_skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center bg-[#F3EEFF] text-[#723EC3] border border-[#D8B4FE] text-xs font-semibold px-3.5 py-1.5 rounded-full cursor-default hover:bg-[#E9D5FF] transition-colors">
                  <span className="mr-1.5 text-[#723EC3] font-bold">+</span> {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Missing Skills
            </h3>
            {missing_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {missing_skills.map((item, i) => (
                  <span key={i} className="inline-flex items-center bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] text-xs font-semibold px-3.5 py-1.5 rounded-full cursor-default hover:bg-[#FCA5A5]/30 transition-colors">
                    <span className="mr-1.5 text-[#DC2626] font-bold">x</span> {item.skill || item}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm font-medium text-slate-600 bg-white p-4 rounded-xl border border-slate-200 text-center">
                You have all the required skills for this role.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
