// frontend/src/components/StatStrip.jsx
import React from 'react';

export default function StatStrip({ matchPercentage, jobsMatched, skillsFound, skillsToLearn }) {
  const getMatchColor = (pct) => {
    if (pct > 50) return 'text-emerald-700';
    if (pct >= 40) return 'text-accent';
    return 'text-red-700';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="glass-card rounded-2xl p-5 text-center transition-transform hover:-translate-y-0.5">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Match
        </div>
        <div className={`text-3xl md:text-4xl font-extrabold tracking-tight ${getMatchColor(matchPercentage)}`}>{matchPercentage}%</div>
      </div>
      <div className="glass-card rounded-2xl p-5 text-center transition-transform hover:-translate-y-0.5">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Jobs Matched</div>
        <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950">{jobsMatched}</div>
      </div>
      <div className="glass-card rounded-2xl p-5 text-center transition-transform hover:-translate-y-0.5">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Skills Found</div>
        <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950">{skillsFound}</div>
      </div>
      <div className="glass-card rounded-2xl p-5 text-center transition-transform hover:-translate-y-0.5 bg-[#FEE2E2] border-[#FCA5A5]">
        <div className="text-xs font-bold text-[#DC2626] uppercase tracking-widest mb-2">Skills to Learn</div>
        <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#DC2626]">{skillsToLearn}</div>
      </div>
    </div>
  );
}
