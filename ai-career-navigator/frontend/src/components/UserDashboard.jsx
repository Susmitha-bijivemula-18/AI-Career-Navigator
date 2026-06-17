// frontend/src/components/UserDashboard.jsx
import React from 'react';

export default function UserDashboard({ loading, error, onRetry, strengths = [], weaknesses = [], learning_path = [] }) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-xl p-5 h-48"></div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 h-48"></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-center justify-center text-center">
        <i className="ti ti-alert-circle text-red-500 text-2xl mb-2"></i>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <button onClick={onRetry} className="px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Retry</button>
      </div>
    );
  }

  if (!strengths.length && !weaknesses.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-10 flex flex-col items-center justify-center text-center">
        <i className="ti ti-file-upload text-gray-300 text-6xl mb-4"></i>
        <p className="text-gray-500">Upload your resume to see your dashboard</p>
      </div>
    );
  }

  const getPriorityColor = (pri) => {
    if (!pri) return 'bg-gray-100 text-gray-600';
    if (pri.toLowerCase() === 'critical') return 'bg-red-50 text-red-800';
    if (pri.toLowerCase() === 'important') return 'bg-amber-50 text-amber-800';
    return 'bg-gray-100 text-gray-600';
  };

  const getWeaknessColor = (missingCount) => {
    if (missingCount >= 7) return 'text-red-600';
    if (missingCount >= 5) return 'text-amber-600';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Strengths</h3>
          <div className="space-y-3">
            {[...strengths].sort((a,b) => b.count - a.count).map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="ti ti-check text-green-500"></i>
                  <span className="text-sm text-gray-700">{item.skill}</span>
                </div>
                <span className="text-xs text-gray-400">{item.count}/10 jobs</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Weaknesses</h3>
          <div className="space-y-3">
            {weaknesses.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="ti ti-alert-triangle text-amber-500"></i>
                  <span className="text-sm text-gray-700">{item.skill}</span>
                </div>
                <span className={`text-xs ${getWeaknessColor(item.missing_count)}`}>
                  Missing {item.missing_count}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Learning path</h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Full study plan ↗
          </button>
        </div>
        <div className="space-y-4">
          {learning_path.map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-3 border border-gray-50 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center text-sm font-medium">
                {i + 1}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{item.skill}</span>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
