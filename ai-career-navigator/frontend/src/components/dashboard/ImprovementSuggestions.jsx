import React from 'react';
import { IconBulb, IconBook2, IconCertificate } from '@tabler/icons-react';

export default function ImprovementSuggestions({ suggestions, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm mt-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Actionable Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 mb-4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!suggestions) {
    return null; 
  }

  const actions = suggestions.actions || [
    {
      type: 'course',
      title: 'Master Advanced React Patterns',
      description: 'Taking a course on advanced React patterns will increase your match score for Senior Developer roles by 15%.'
    },
    {
      type: 'project',
      title: 'Build a GraphQL API',
      description: 'Adding a GraphQL project to your portfolio addresses a key skill gap found in your target roles.'
    },
    {
      type: 'cert',
      title: 'AWS Developer Certification',
      description: '54% of your matched roles request cloud experience. This certification provides a strong trust signal.'
    }
  ];

  const getIcon = (type, idx) => {
    if (type === 'course' || idx === 0) return <IconBook2 className="w-5 h-5" />;
    if (type === 'cert' || idx === 2) return <IconCertificate className="w-5 h-5" />;
    return <IconBulb className="w-5 h-5" />;
  };

  const getColorClass = (type, idx) => {
    if (type === 'course' || idx === 0) return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20';
    if (type === 'cert' || idx === 2) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
    return 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Actionable Next Steps</h3>
        <span className="inline-flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-md">
          AI Generated
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.slice(0, 3).map((action, idx) => {
          const colorClass = getColorClass(action.type, idx);
          
          return (
            <div key={idx} className="p-6 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex flex-col h-full">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 border ${colorClass}`}>
                {getIcon(action.type, idx)}
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                {action.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
                {action.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
