// frontend/src/components/UserDashboard.jsx
import React from 'react';

export default function UserDashboard({ loading, error, onRetry, strengths = [], weaknesses = [], learning_path = [] }) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 h-48"></div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 h-48"></div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
        <i className="ti ti-alert-circle text-red-500 text-2xl mb-2"></i>
        <p className="text-sm text-slate-600 mb-4">{error}</p>
        <button onClick={onRetry} className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">Retry</button>
      </div>
    );
  }

  if (!strengths.length && !weaknesses.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
        <i className="ti ti-file-upload text-slate-300 text-6xl mb-4"></i>
        <p className="text-slate-500">Upload your resume to see your dashboard</p>
      </div>
    );
  }

  const getPriorityColor = (pri) => {
    if (!pri) return 'bg-slate-100 text-slate-600';
    if (pri.toLowerCase() === 'critical') return 'bg-red-50 text-red-700';
    if (pri.toLowerCase() === 'important') return 'bg-amber-50 text-amber-700';
    return 'bg-slate-100 text-slate-600';
  };

  const getWeaknessColor = (missingCount) => {
    if (missingCount >= 7) return 'text-red-600';
    if (missingCount >= 5) return 'text-amber-600';
    return 'text-slate-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Strengths</h3>
          <div className="space-y-3">
            {[...strengths].sort((a,b) => b.count - a.count).map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <i className="ti ti-check text-emerald-500"></i>
                  <span className="text-sm text-slate-700 truncate">{item.skill}</span>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{item.count}/10 jobs</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Weaknesses</h3>
          <div className="space-y-3">
            {weaknesses.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <i className="ti ti-alert-triangle text-amber-500"></i>
                  <span className="text-sm text-slate-700 truncate">{item.skill}</span>
                </div>
                <span className={`text-xs shrink-0 ${getWeaknessColor(item.missing_count)}`}>
                  Missing {item.missing_count}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-5 gap-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Learning path</h3>
          <button className="text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1">
            Full study plan
          </button>
        </div>
        <div className="space-y-4">
          {learning_path.map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between mb-1 gap-3">
                  <span className="text-sm font-semibold text-slate-950 truncate">{item.skill}</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
