import React from 'react';

export default function ParsedSkillsCard({ analysis, recommendations, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm min-h-[350px]">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Skills Analysis</h3>
        <div className="animate-pulse space-y-6">
          <div>
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              ))}
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
            <div className="h-3 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="mb-4">
                <div className="flex justify-between mb-2">
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analysis || !recommendations) {
    return null; 
  }

  const matchedSkills = analysis.skills || ['React', 'JavaScript', 'Node.js', 'CSS', 'HTML'];
  
  const missingSkills = recommendations.missing_skills || [
    { name: 'TypeScript', impact: 85, priority: 'Critical' },
    { name: 'GraphQL', impact: 60, priority: 'Important' },
    { name: 'Docker', impact: 40, priority: 'Important' }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm flex flex-col h-full">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Skills Analysis</h3>
      
      {/* Top half: Matched Skills */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Extracted Skills</h4>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.map((skill, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      {/* Bottom half: Missing Skills */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex-1">
        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Skills to Learn</h4>
        <div className="space-y-4">
          {missingSkills.slice(0, 3).map((skill, idx) => {
            const isCritical = skill.priority === 'Critical';
            
            return (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {skill.name}
                  </span>
                  <span 
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isCritical 
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400' 
                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {skill.priority}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}
                    style={{ width: `${skill.impact}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
