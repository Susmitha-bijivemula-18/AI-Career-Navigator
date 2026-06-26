// frontend/src/components/MatchSimulator.jsx
import React, { useState } from 'react';

export default function MatchSimulator({ loading, error, onRetry, job, current_match = 0, missing_skills_with_deltas = [] }) {
  const [selected, setSelected] = useState([]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5 animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-1/3 mb-5"></div>
        <div className="space-y-4 mb-6">
          <div className="h-4 bg-slate-100 rounded-full"></div>
          <div className="h-4 bg-slate-100 rounded-full"></div>
        </div>
        <div className="h-48 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center text-center border-red-200 bg-red-50">
        <svg className="w-8 h-8 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p className="text-sm font-medium text-red-700 mb-4">{error}</p>
        <button onClick={onRetry} className="px-5 py-2 rounded-xl text-sm font-bold border border-red-200 text-red-700 bg-white hover:bg-red-50 transition-colors">Retry</button>
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
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className="relative z-10">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h2 className="text-sm font-bold text-slate-950 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            Simulation Mode Active
          </h2>
        </div>

        <div className="space-y-5 mb-8">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
              <span>Current match</span>
              <span>{current_match}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-slate-400 transition-all duration-300" style={{ width: `${current_match}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
              <span>Simulated match</span>
              <span className="text-indigo-700 font-extrabold">{simulated}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
              <div className="h-full bg-slate-300 absolute left-0 top-0 bottom-0" style={{ width: `${current_match}%` }}></div>
              <div className="h-full bg-indigo-500 absolute top-0 bottom-0 transition-all duration-300" style={{ left: `${current_match}%`, width: `${deltaImprovement}%` }}></div>
            </div>
          </div>
        </div>

        {deltaImprovement > 0 && (
          <div className="mb-8 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-lg inline-flex items-center gap-2 animate-fadeIn">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            Match improves by +{deltaImprovement}% with these skills
          </div>
        )}

        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Select skills to learn
          </h3>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {missing_skills_with_deltas.length === 0 && (
              <p className="text-sm text-slate-500 font-medium italic">No actionable skills found to improve match score.</p>
            )}
            {missing_skills_with_deltas.map((sk, i) => {
              const isChecked = selected.some(s => s.skill === sk.skill);
              return (
                <label key={i} className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition-all duration-300 gap-3 ${isChecked ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-white'}`}>
                  <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleSkill(sk)} />
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${isChecked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                      {isChecked && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                    <span className={`text-sm font-semibold truncate ${isChecked ? 'text-slate-950' : 'text-slate-700'}`}>{sk.skill}</span>
                  </div>
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full shrink-0 ${isChecked ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
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
