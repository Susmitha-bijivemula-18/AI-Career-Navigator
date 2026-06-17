import React, { useState } from 'react';

const AISuggestions = ({ suggestions }) => {
  const [activeTab, setActiveTab] = useState('skills');
  const [expandedSkill, setExpandedSkill] = useState(null);

  if (!suggestions) return null;

  return (
    <div className="glass-card rounded-2xl border-white/10 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/10 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="bg-white/5 border-b border-white/10 p-5">
          <h3 className="text-xl font-bold flex items-center text-white drop-shadow-md">
            <svg className="w-6 h-6 mr-2.5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Career Suggestions
          </h3>
        </div>
        
        <div className="flex border-b border-white/10 bg-black/20">
          <button 
            onClick={() => setActiveTab('skills')}
            className={`flex-1 py-3.5 text-sm font-bold transition-all duration-300 ${activeTab === 'skills' ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10 text-glow' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
          >
            Skills to Learn
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-3.5 text-sm font-bold transition-all duration-300 ${activeTab === 'projects' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-500/10 text-glow' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
          >
            Project Ideas
          </button>
          <button 
            onClick={() => setActiveTab('resume')}
            className={`flex-1 py-3.5 text-sm font-bold transition-all duration-300 ${activeTab === 'resume' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/10 text-glow' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
          >
            Resume Tips
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'skills' && (
            <div className="space-y-4 animate-fadeIn">
              {suggestions.skills_to_learn?.map((item, idx) => (
                <div key={idx} className="border border-white/10 rounded-xl overflow-hidden shadow-sm bg-white/5 transition-colors hover:border-purple-500/30">
                  <button 
                    onClick={() => setExpandedSkill(expandedSkill === item.skill ? null : item.skill)}
                    className="w-full flex items-center justify-between p-4 hover:bg-purple-500/10 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-black text-xs mr-3 shadow-inner">
                        #{item.priority}
                      </span>
                      <span className="font-bold text-slate-200 tracking-wide">{item.skill}</span>
                    </div>
                    <svg className={`w-5 h-5 text-slate-500 transform transition-transform duration-300 ${expandedSkill === item.skill ? 'rotate-180 text-purple-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSkill === item.skill && (
                    <div className="px-4 pb-4 pt-2 bg-purple-900/10 text-slate-400 text-sm border-t border-purple-500/20 font-light leading-relaxed animate-fadeIn">
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
                <div key={idx} className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl p-5 hover:border-cyan-400/40 transition-colors shadow-sm">
                  <h4 className="font-extrabold text-white mb-2 tracking-tight drop-shadow-md">{project.title}</h4>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed font-light">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.skills_demonstrated?.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider">
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
                  <li key={idx} className="flex items-start bg-white/5 p-4 rounded-xl border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-900/10 transition-colors">
                    <svg className="w-5 h-5 text-emerald-400 mr-3 mt-0.5 flex-shrink-0 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-slate-300 text-sm leading-relaxed font-medium">{tip}</span>
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
