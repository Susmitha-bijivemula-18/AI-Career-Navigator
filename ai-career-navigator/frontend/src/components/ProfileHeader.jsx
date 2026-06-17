// frontend/src/components/ProfileHeader.jsx
import React from 'react';

export default function ProfileHeader({ userName = "Applicant", experienceLevel = "Junior", onReanalyze, lastUpdated = "0 min ago" }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-8 p-6 glass-card rounded-2xl animate-fadeIn">
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
        <h2 className="text-2xl font-bold text-white tracking-tight">{userName}</h2>
        <div className="h-1.5 w-1.5 rounded-full bg-slate-600 hidden md:block"></div>
        <span className="text-sm text-slate-400 font-medium">Resume analysed · {lastUpdated}</span>
        <span className="bg-cyan-500/10 text-cyan-400 text-xs font-extrabold px-3 py-1 rounded-full border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
          {experienceLevel}
        </span>
      </div>
      <button 
        onClick={onReanalyze}
        className="px-5 py-2 rounded-xl text-sm font-bold border border-slate-700 text-slate-300 hover:bg-white/10 hover:text-white hover:border-slate-500 transition-all duration-300"
      >
        Re-analyse
      </button>
    </div>
  );
}
