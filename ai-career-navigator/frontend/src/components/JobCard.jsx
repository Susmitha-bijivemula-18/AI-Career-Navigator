// src/components/JobCard.jsx - single job match card
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { aiClient } from '../api/aiClient';
import SkillGapPanel from './SkillGapPanel';
import MatchSimulator from './MatchSimulator';

export default function JobCard({ job, resumeSkills }) {
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [loadingGap, setLoadingGap] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const totalSkills = job.required_skills ? job.required_skills.length : 0;
  const skillDelta = totalSkills > 0 ? Math.round(100 / totalSkills) : 0;
  const missingSkillsWithDeltas = gapAnalysis && gapAnalysis.missing_skills
    ? gapAnalysis.missing_skills.map(item => ({
        skill: typeof item === 'string' ? item : item.skill,
        delta: skillDelta
      }))
    : [];

  let matchColor = 'text-slate-600 bg-white border-slate-200';
  const matchPct = job.match_percentage || 0;
  
  if (matchPct > 0) {
    if (matchPct > 50) {
      matchColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (matchPct >= 40) {
      matchColor = 'text-accent bg-accent/10 border-accent/20';
    } else {
      matchColor = 'text-red-700 bg-red-50 border-red-200';
    }
  }

  const handleAnalyzeGap = async () => {
    if (!resumeSkills) return;
    if (gapAnalysis) {
      setShowAnalysisModal(true);
      return;
    }
    setLoadingGap(true);
    try {
      const result = await aiClient.getGapAnalysis(resumeSkills, job.id);
      setGapAnalysis(result);
      setShowAnalysisModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGap(false);
    }
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col h-full relative group">
      <div className="p-6 flex-grow relative z-10">
        <div className="flex justify-between items-start gap-4 mb-5">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-950 group-hover:text-primary transition-colors duration-300 leading-snug">{job.role}</h3>
            <p className="text-sm text-slate-500 font-medium mt-1.5">{job.company}</p>
          </div>
          
          {matchPct > 0 && (
            <div className={`shrink-0 px-3 py-1.5 rounded-xl border flex items-center justify-center transition-all duration-300 ${matchColor}`}>
              {matchPct >= 40 && (
                <span className="text-[10px] mr-1.5 font-bold uppercase tracking-wider opacity-90">Matched</span>
              )}
              <span className="text-lg font-black">{matchPct}</span>
              <span className="text-xs ml-0.5 font-bold uppercase tracking-wider">%</span>
            </div>
          )}
        </div>

        {job.reason && (
          <div className="mb-5 text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100">
            <strong className="text-slate-950 block mb-1">Why this role?</strong> {job.reason}
          </div>
        )}

        {!gapAnalysis && job.matched_skills && job.matched_skills.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Matched Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {job.matched_skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F3EEFF] text-[#723EC3] border border-[#D8B4FE] shadow-sm">
                  <span className="mr-1.5 text-[#723EC3] font-bold">+</span> {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {resumeSkills && (
          <div className="mt-5 mb-2">
            <button 
              onClick={handleAnalyzeGap}
              disabled={loadingGap}
              className="text-sm font-bold text-primary flex items-center hover:text-primary-dark hover:underline transition-all disabled:text-slate-400"
            >
              {loadingGap ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Gap...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {gapAnalysis ? 'View Deep Gap Analysis' : 'Run Deep Gap Analysis'}
                </>
              )}
            </button>
          </div>
        )}

        {showAnalysisModal && gapAnalysis && createPortal(
          <div className="job-card-portal-root">
            <div 
              className="fixed inset-0 z-[9990] bg-slate-950/35 backdrop-blur-sm transition-opacity"
              onClick={() => setShowAnalysisModal(false)}
            ></div>
            
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-slate-200 shadow-[0_0_55px_rgba(15,23,42,0.20)] z-[9999] flex flex-col overflow-y-auto animate-slideInRight">
              <div className="sticky top-0 bg-white/95 backdrop-blur-md p-6 border-b border-slate-200 flex justify-between items-start z-50 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-slate-950 mb-1 flex items-center gap-3">
                    Deep Gap Analysis
                    <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${matchColor}`}>
                      {gapAnalysis.match_percentage}% Match
                    </span>
                  </h3>
                  <p className="text-sm text-primary font-medium">{job.role}</p>
                  <p className="text-xs text-slate-500 mt-1">{job.company}</p>
                </div>
                <button 
                  onClick={() => setShowAnalysisModal(false)}
                  className="p-2 -mr-2 -mt-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Close gap analysis"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="p-6 flex-grow flex flex-col bg-white/70">
                <SkillGapPanel 
                  matched_skills={gapAnalysis.matched_skills} 
                  missing_skills={gapAnalysis.missing_skills} 
                  job={job}
                  match_percentage={gapAnalysis.match_percentage}
                />

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <button 
                    onClick={() => setShowSimulator(!showSimulator)}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white hero-gradient hover:shadow-lg hover:-translate-y-0.5 flex justify-center items-center transition-all"
                  >
                    <svg className={`w-5 h-5 mr-2 transform transition-transform ${showSimulator ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    {showSimulator ? 'Hide Simulator' : 'Simulate Score Improvement'}
                  </button>
                  
                  {showSimulator && (
                    <div className="mt-6 animate-fadeIn">
                      <MatchSimulator 
                        job={job} 
                        current_match={gapAnalysis.match_percentage} 
                        missing_skills_with_deltas={missingSkillsWithDeltas}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
      
      <div className="p-6 pt-0 mt-auto relative z-10">
        <a 
          href={job.apply_url || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white hero-gradient hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
}
