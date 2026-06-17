// frontend/src/components/StatStrip.jsx
import React from 'react';

export default function StatStrip({ matchPercentage, jobsMatched, skillsFound, skillsToLearn }) {
  const getMatchColor = (pct) => {
    if (pct >= 70) return 'text-emerald-400 text-glow';
    if (pct >= 40) return 'text-amber-400 text-glow';
    return 'text-red-400 text-glow';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="glass-card rounded-2xl p-5 text-center transform transition-transform hover:-translate-y-1">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>Match
        </div>
        <div className={`text-4xl font-extrabold tracking-tighter ${getMatchColor(matchPercentage)}`}>{matchPercentage}%</div>
      </div>
      <div className="glass-card rounded-2xl p-5 text-center transform transition-transform hover:-translate-y-1">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Jobs Matched</div>
        <div className="text-4xl font-extrabold tracking-tighter text-white drop-shadow-md">{jobsMatched}</div>
      </div>
      <div className="glass-card rounded-2xl p-5 text-center transform transition-transform hover:-translate-y-1">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Skills Found</div>
        <div className="text-4xl font-extrabold tracking-tighter text-white drop-shadow-md">{skillsFound}</div>
      </div>
      <div className="glass-card border-purple-500/30 rounded-2xl p-5 text-center transform transition-transform hover:-translate-y-1 bg-purple-900/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
        <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Skills to Learn</div>
        <div className="text-4xl font-extrabold tracking-tighter text-purple-400 text-glow">{skillsToLearn}</div>
      </div>
    </div>
  );
}
