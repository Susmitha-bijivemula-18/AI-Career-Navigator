import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowRight } from '@tabler/icons-react';

export default function RecommendedJobs({ jobs, isLoading }) {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[350px]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recommended Jobs</h3>
        </div>
        <div className="p-6 animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return null; 
  }

  const displayJobs = jobs.slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recommended Jobs</h3>
      </div>
      
      <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-700/50">
        {displayJobs.map((job, idx) => (
          <div 
            key={idx} 
            onClick={() => navigate(`/jobs/${job.job_id || job.id}`)}
            className="p-5 hover:bg-white dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm p-1.5 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/50 transition-colors">
                <img src={`https://icon.horse/icon/${job.company?.toLowerCase()?.replace(/[^a-z0-9]/g, '')}.com`} alt={job.company} className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=' + (job.company || 'C') + '&background=e0e7ff&color=4f46e5'; }} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {job.title || job.role}
                </h4>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {job.company} • {job.salary_min ? `$${job.salary_min/1000}k` : 'Competitive'}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {Math.round(job.match_score * 100 || 85)}% Match
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <button className="w-full py-2.5 flex justify-center items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
          View all recommendations
          <IconArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
