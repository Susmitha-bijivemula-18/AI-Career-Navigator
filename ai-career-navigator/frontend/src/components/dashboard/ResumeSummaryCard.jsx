import React from 'react';

export default function ResumeSummaryCard({ analysis, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm min-h-[300px] flex flex-col">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Summary</h3>
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-14 w-14"></div>
          <div className="flex-1 space-y-3 py-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          </div>
        </div>
        <div className="mt-8 space-y-3">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
        <p>Upload your resume to see your AI-generated profile summary here.</p>
      </div>
    );
  }

  const initials = analysis.name 
    ? analysis.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'JD';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm flex flex-col h-full">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Summary</h3>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold border border-indigo-200 dark:border-indigo-500/30">
          {initials}
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">{analysis.name || 'Candidate Profile'}</h4>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {analysis.experience_level || 'Mid Level'}
          </span>
        </div>
      </div>
      
      <div className="mb-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-grow">
        <p>{analysis.summary || 'A seasoned professional with a strong background in software engineering and cloud architecture.'}</p>
      </div>
      
      <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
        <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Predicted Roles</h5>
        <div className="flex flex-wrap gap-2">
          {(analysis.predicted_roles || ['Software Engineer', 'Frontend Developer']).map((role, idx) => (
            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20">
              {role}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
