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

  let matchColor = 'text-slate-400 bg-white/5 border-white/10 shadow-sm';
  const matchPct = job.match_percentage || 0;
  
  if (matchPct > 0) {
    if (matchPct < 40) {
      matchColor = 'text-red-400 bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
    } else if (matchPct < 70) {
      matchColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
    } else {
      matchColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
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
      <div className="p-7 flex-grow relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-xl font-extrabold text-white group-hover:text-cyan-400 transition-colors duration-300 drop-shadow-md">{job.role}</h3>
            <p className="text-sm text-slate-400 font-medium mt-1.5">{job.company}</p>
          </div>
          
          {matchPct > 0 && (
            <div className={`px-4 py-1.5 rounded-2xl border flex items-center justify-center transition-all duration-300 ${matchColor}`}>
              {matchPct >= 40 && (
                <span className="text-xs mr-1.5 font-bold uppercase tracking-wider opacity-90">Matched</span>
              )}
              <span className="text-xl font-black">{matchPct}</span>
              <span className="text-xs ml-0.5 font-bold uppercase tracking-wider">
                %
              </span>
            </div>
          )}
        </div>

        {job.reason && (
          <div className="mb-5 text-sm text-slate-300 bg-white/5 p-4 rounded-xl border border-white/10 shadow-inner">
            <strong className="text-cyan-400 block mb-1">Why this role?</strong> {job.reason}
          </div>
        )}

        {!gapAnalysis && job.matched_skills && job.matched_skills.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-extrabold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Matched Skills
            </p>
            <div className="flex flex-wrap gap-2.5">
              {job.matched_skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                  <span className="mr-1.5 text-emerald-500 font-bold">✓</span> {skill}
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
              className="text-sm font-bold text-cyan-400 flex items-center hover:text-cyan-300 hover:underline transition-all"
            >
              {loadingGap ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-[9990] bg-slate-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setShowAnalysisModal(false)}
            ></div>
            
            {/* Side Panel */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-800 border-l border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[9999] flex flex-col overflow-y-auto animate-slideInRight">
              <div className="sticky top-0 bg-slate-800/95 backdrop-blur-md p-6 border-b border-slate-700 flex justify-between items-start z-10">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Deep Gap Analysis</h3>
                  <p className="text-sm text-cyan-400 font-medium">{job.role}</p>
                  <p className="text-xs text-slate-400 mt-1">{job.company}</p>
                </div>
                <button 
                  onClick={() => setShowAnalysisModal(false)}
                  className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <SkillGapPanel 
                  matched_skills={gapAnalysis.matched_skills} 
                  missing_skills={gapAnalysis.missing_skills} 
                  job={job}
                  match_percentage={gapAnalysis.match_percentage}
                />

                <div className="mt-8 pt-6 border-t border-slate-700">
                  <button 
                    onClick={() => setShowSimulator(!showSimulator)}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20 flex justify-center items-center transition-all"
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
          className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-extrabold text-white bg-white/10 border border-white/20 hover:bg-cyan-500 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transform transition-all duration-300"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
}
