// frontend/src/components/MatchSimulator.jsx
import React, { useState } from 'react';

export default function MatchSimulator({ loading, error, onRetry, job, current_match = 0, missing_skills_with_deltas = [] }) {
  const [selected, setSelected] = useState([]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5 animate-pulse border-white/5">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-5"></div>
        <div className="space-y-4 mb-6">
          <div className="h-4 bg-slate-800 rounded-full"></div>
          <div className="h-4 bg-slate-800 rounded-full"></div>
        </div>
        <div className="h-48 bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center text-center border-red-500/30 bg-red-900/10">
        <svg className="w-8 h-8 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p className="text-sm font-medium text-red-400 mb-4">{error}</p>
        <button onClick={onRetry} className="px-5 py-2 rounded-xl text-sm font-bold border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-colors">Retry</button>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const toggleSkill = (skillObj) => {
    setSelected(prev => {
      const exists = prev.find(s => s.skill === skillObj.skill);
      if (exists) return prev.filter(s => s.skill !== skillObj.skill);
      return [...prev, skillObj];
    });
  };

  const simulated = Math.min(100, current_match + selected.reduce((s, sk) => s + sk.delta, 0));
  const deltaImprovement = simulated - current_match;

  return (
    <div className="glass-card rounded-2xl p-6 border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="mb-6 border-b border-white/10 pb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Simulation Mode Active
          </h2>
        </div>

        <div className="space-y-5 mb-8">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
              <span>Current match</span>
              <span>{current_match}%</span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
              <div className="h-full bg-slate-500 transition-all duration-300" style={{ width: `${current_match}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
              <span>Simulated match</span>
              <span className="text-purple-400 font-extrabold">{simulated}%</span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700 shadow-inner">
              <div className="h-full bg-slate-600 absolute left-0 top-0 bottom-0 opacity-50" style={{ width: `${current_match}%` }}></div>
              <div className="h-full bg-purple-500 absolute top-0 bottom-0 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.8)]" style={{ left: `${current_match}%`, width: `${deltaImprovement}%` }}></div>
            </div>
          </div>
        </div>

        {deltaImprovement > 0 && (
          <div className="mb-8 text-xs font-bold text-purple-300 bg-purple-900/20 border border-purple-500/30 px-4 py-2.5 rounded-lg inline-flex items-center gap-2 shadow-[0_0_10px_rgba(168,85,247,0.15)] animate-fadeIn">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            Match improves by +{deltaImprovement}% with these skills
          </div>
        )}

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Select skills to learn
          </h3>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {missing_skills_with_deltas.length === 0 && (
              <p className="text-sm text-slate-500 font-medium italic">No actionable skills found to improve match score.</p>
            )}
            {missing_skills_with_deltas.map((sk, i) => {
              const isChecked = selected.some(s => s.skill === sk.skill);
              return (
                <label key={i} className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all duration-300 ${isChecked ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-white/5 border-white/10 hover:border-purple-500/30 hover:bg-white/10'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-purple-500 border-purple-500' : 'border-slate-500 bg-slate-800'}`}>
                      {isChecked && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                    <span className={`text-sm font-semibold ${isChecked ? 'text-white' : 'text-slate-300'}`}>{sk.skill}</span>
                  </div>
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${isChecked ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    +{sk.delta}%
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
