// frontend/src/components/AIAnalysisCard.jsx
import React from 'react';

export default function AIAnalysisCard({ loading, error, onRetry, skills = [], predicted_roles = [], ai_summary = "", experience_level = "" }) {
  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse border-white/5">
        <div className="h-6 bg-slate-800 rounded w-1/4 mb-5"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-32 bg-slate-800/50 rounded-xl"></div>
          <div className="h-32 bg-slate-800/50 rounded-xl"></div>
        </div>
        <div className="h-24 bg-slate-800/50 rounded-xl mt-8"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center border-red-500/30 bg-red-900/10">
        <svg className="w-8 h-8 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p className="text-sm font-medium text-red-400 mb-5">{error}</p>
        <button onClick={onRetry} className="px-5 py-2 rounded-xl text-sm font-bold border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-colors">Retry Analysis</button>
      </div>
    );
  }

  if (!skills.length && !predicted_roles.length) {
    return null;
  }

  const getRoleColor = (pct) => {
    if (pct >= 80) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    if (pct >= 60) return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border-white/10 group hover:border-cyan-500/30 transition-colors">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            Predicted Roles
          </h3>
          <div className="space-y-3">
            {predicted_roles.slice(0, 3).map((role, idx) => {
              const mockFit = [92, 85, 78][idx] || 70;
              const roleName = typeof role === 'string' ? role : role.role;
              return (
                <div key={idx} className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 group-hover:bg-white/10 transition-colors">
                  <span className="text-sm font-semibold text-white">{roleName}</span>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${getRoleColor(mockFit)}`}>
                    {mockFit}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 border-white/10 group hover:border-purple-500/30 transition-colors">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Skills Detected
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {skills.map((skill, idx) => (
              <span key={idx} className="inline-flex items-center bg-purple-500/10 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)] text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-default">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="glass-card rounded-2xl p-6 border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/10 to-purple-900/10 pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            AI Summary
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-5 font-light">{ai_summary}</p>
          <button className="text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors group">
            Get improvement suggestions 
            <svg className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
