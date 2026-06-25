// frontend/src/components/ProfileHeader.jsx
import React from 'react';

export default function ProfileHeader({ userName = "Applicant", experienceLevel = "Junior", onReanalyze, lastUpdated = "0 min ago" }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 p-5 md:p-6 glass-card rounded-2xl animate-fadeIn gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <h2 className="text-2xl font-bold text-slate-950 tracking-tight">{userName}</h2>
        <div className="h-1.5 w-1.5 rounded-full bg-slate-300 hidden sm:block"></div>
        <span className="text-sm text-slate-500 font-medium">Resume analysed - {lastUpdated}</span>
        <span className="bg-primary/5 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
          {experienceLevel}
        </span>
      </div>
      <button 
        onClick={onReanalyze}
        className="px-5 py-2.5 rounded-xl text-sm font-bold border border-borderLight text-slate-700 bg-cardBg hover:bg-bgLight hover:text-textMain transition-all duration-300 shadow-sm"
      >
        Re-analyse
      </button>
    </div>
  );
}
