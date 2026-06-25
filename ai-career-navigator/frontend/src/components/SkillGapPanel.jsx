// frontend/src/components/SkillGapPanel.jsx
import React, { useState } from 'react';

export default function SkillGapPanel({ loading, error, onRetry, job, matched_skills = [], missing_skills = [], match_percentage = 0 }) {
  const [openReasons, setOpenReasons] = useState({});

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 mt-5 animate-pulse border-white/5">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-5"></div>
        <div className="h-2 bg-slate-800 rounded-full mb-8"></div>
        <div className="grid grid-cols-2 gap-8">
          <div className="h-32 bg-slate-800/50 rounded-xl"></div>
          <div className="h-32 bg-slate-800/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 mt-5 flex flex-col items-center justify-center text-center border-red-500/30 bg-red-900/10">
        <svg className="w-8 h-8 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p className="text-sm font-medium text-red-400 mb-5">{error}</p>
        <button onClick={onRetry} className="px-5 py-2 rounded-xl text-sm font-bold border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-colors">Retry Analysis</button>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const toggle = (skill) => setOpenReasons(prev => ({ ...prev, [skill]: !prev[skill] }));

  const getMatchColor = (pct) => {
    if (pct >= 70) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    if (pct >= 40) return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    return 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
  };

  const getBarColor = (pct) => {
    if (pct >= 70) return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
    if (pct >= 40) return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
  };

  return (
    <div className="glass-card rounded-2xl p-6 mt-5 relative overflow-hidden group border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            {job.company} <span className="text-slate-500 font-light px-1">|</span> <span className="text-cyan-400">{job.role}</span>
          </h2>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all ${getMatchColor(match_percentage)}`}>
              {match_percentage}% Match
            </span>
            <a 
              href={job.apply_url || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-white hover:border-cyan-400 transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)]"
            >
              Apply Now
            </a>
          </div>
        </div>
        
        <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden mb-8 shadow-inner border border-slate-700">
          <div className={`h-full rounded-full transition-all duration-1000 ${getBarColor(match_percentage)}`} style={{ width: `${match_percentage}%` }}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Matched Skills
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {matched_skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-default hover:bg-emerald-500/20 transition-colors">
                  <span className="mr-1.5 text-emerald-500 font-bold">✓</span> {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Missing Skills
            </h3>
            {missing_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {missing_skills.map((item, i) => (
                  <span key={i} className="inline-flex items-center bg-red-900/20 text-red-400 border border-red-500/30 text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-default hover:bg-red-500/20 transition-colors">
                    <span className="mr-1.5 text-red-500 font-bold">✗</span> {item.skill || item}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm font-medium text-slate-400 italic bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
                You have all the required skills for this role! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
