// frontend/src/components/AIAnalysisCard.jsx
import React from 'react';

export default function AIAnalysisCard({ loading, error, onRetry, skills = [], predicted_roles = [], ai_summary = "" }) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-1/4 mb-5"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-slate-100 rounded-xl"></div>
          <div className="h-32 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="h-24 bg-slate-100 rounded-xl mt-6"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center border-red-200 bg-red-50">
        <svg className="w-8 h-8 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p className="text-sm font-medium text-red-700 mb-5">{error}</p>
        <button onClick={onRetry} className="px-5 py-2 rounded-xl text-sm font-bold border border-red-200 text-red-700 bg-white hover:bg-red-50 transition-colors">Retry Analysis</button>
      </div>
    );
  }

  if (!skills.length && !predicted_roles.length) {
    return null;
  }

  const getRoleColor = (pct) => {
    if (pct >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (pct >= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 group hover:border-teal-200 transition-colors">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            Predicted Roles
          </h3>
          <div className="space-y-3">
            {predicted_roles.slice(0, 3).map((role, idx) => {
              const mockFit = [92, 85, 78][idx] || 70;
              const roleName = typeof role === 'string' ? role : role.role;
              return (
                <div key={idx} className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 group-hover:bg-white transition-colors gap-3">
                  <span className="text-sm font-semibold text-slate-800 truncate">{roleName}</span>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full border shrink-0 ${getRoleColor(mockFit)}`}>
                    {mockFit}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 group hover:border-indigo-200 transition-colors">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Skills Detected
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {skills.map((skill, idx) => (
              <span key={idx} className="inline-flex items-center bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold px-3.5 py-1.5 rounded-full cursor-default">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            AI Summary
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">{ai_summary}</p>
          <button className="text-sm font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 transition-colors group">
            Get improvement suggestions 
            <svg className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
