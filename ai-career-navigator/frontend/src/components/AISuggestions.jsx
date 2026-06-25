import React, { useState } from 'react';

const AISuggestions = ({ suggestions }) => {
  const [activeTab, setActiveTab] = useState('skills');
  const [expandedSkill, setExpandedSkill] = useState(null);

  if (!suggestions) return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden relative group">
      <div className="relative z-10">
        <div className="bg-slate-50 border-b border-slate-200 p-5">
          <h3 className="text-xl font-bold flex items-center text-slate-950">
            <svg className="w-6 h-6 mr-2.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Career Suggestions
          </h3>
        </div>
        
        <div className="flex border-b border-slate-200 bg-white overflow-x-auto">
          <button 
            onClick={() => setActiveTab('skills')}
            className={`flex-1 min-w-32 py-3.5 text-sm font-bold transition-all duration-300 ${activeTab === 'skills' ? 'text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            Skills to Learn
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`flex-1 min-w-32 py-3.5 text-sm font-bold transition-all duration-300 ${activeTab === 'projects' ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            Project Ideas
          </button>
          <button 
            onClick={() => setActiveTab('resume')}
            className={`flex-1 min-w-32 py-3.5 text-sm font-bold transition-all duration-300 ${activeTab === 'resume' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            Resume Tips
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'skills' && (
            <div className="space-y-4 animate-fadeIn">
              {suggestions.skills_to_learn?.map((item, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white transition-colors hover:border-indigo-200">
                  <button 
                    onClick={() => setExpandedSkill(expandedSkill === item.skill ? null : item.skill)}
                    className="w-full flex items-center justify-between p-4 hover:bg-indigo-50 transition-colors gap-4"
                  >
                    <div className="flex items-center min-w-0">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-black text-xs mr-3">
                        #{item.priority}
                      </span>
                      <span className="font-bold text-slate-800 tracking-wide truncate">{item.skill}</span>
                    </div>
                    <svg className={`w-5 h-5 text-slate-500 transform transition-transform duration-300 shrink-0 ${expandedSkill === item.skill ? 'rotate-180 text-indigo-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSkill === item.skill && (
                    <div className="px-4 pb-4 pt-2 bg-indigo-50 text-slate-600 text-sm border-t border-indigo-100 leading-relaxed animate-fadeIn">
                      {item.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-5 animate-fadeIn">
              {suggestions.project_ideas?.map((project, idx) => (
                <div key={idx} className="bg-teal-50 border border-teal-100 rounded-xl p-5 hover:border-teal-200 transition-colors shadow-sm">
                  <h4 className="font-extrabold text-slate-950 mb-2 tracking-tight">{project.title}</h4>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.skills_demonstrated?.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white text-teal-700 border border-teal-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="animate-fadeIn">
              <ul className="space-y-3">
                {suggestions.resume_tips?.map((tip, idx) => (
                  <li key={idx} className="flex items-start bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
                    <svg className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-slate-700 text-sm leading-relaxed font-medium">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;
