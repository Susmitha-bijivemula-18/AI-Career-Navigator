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

  // Procedurally generate job type and posted time based on company name to look realistic
  const nameLen = job.company ? job.company.length : 5;
  const jobType = nameLen % 3 === 0 ? 'Contract' : (nameLen % 5 === 0 ? 'Part-time' : 'Full-time');
  
  const timeNum = (nameLen * 3) % 24 + 1;
  const timeUnit = nameLen % 2 === 0 ? 'hours' : 'days';
  const postedTime = `${timeNum} ${timeUnit} ago`;

  const [imgError, setImgError] = useState(false);
  
  // Try to generate a domain from the company name, e.g. 'Amazon' -> 'amazon.com', 'TCS' -> 'tcs.com'
  const domain = job.company ? `${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : null;
  // Use explicit logo, or generate from Google Favicon API
  const logoUrl = job.company_logo || (domain ? `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128` : null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 flex-grow flex flex-col">
        {/* Top row: Logo, Title/Company, Job Type Badge */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl border border-slate-100 flex items-center justify-center bg-white overflow-hidden shrink-0 shadow-sm p-2">
              {!imgError && logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={job.company} 
                  className="w-full h-full object-contain" 
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full bg-slate-100 text-slate-400 font-bold flex items-center justify-center rounded-lg text-lg">
                  {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold text-slate-900 leading-tight">{job.role}</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">{job.company}</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md shrink-0">
            {jobType}
          </div>
        </div>

        {/* Location and Time */}
        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium mb-6">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location || 'Remote'}
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {postedTime}
          </div>
        </div>

        {/* Separator line */}
        <div className="border-t border-slate-100 w-full my-4"></div>

        {/* Bottom row: Active Hiring, Apply Button */}
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Active hiring
          </div>
          <a 
            href={job.apply_url || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors"
          >
            Apply Now
          </a>
        </div>

        {/* AI Analysis Section (Visible if we have skills or gap analysis) */}
        {resumeSkills && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            {matchPct > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded-md ${matchColor}`}>
                  {matchPct}% Match
                </span>
                <span className="text-xs text-slate-500 font-medium">based on your resume</span>
              </div>
            )}
            
            <button 
              onClick={handleAnalyzeGap}
              disabled={loadingGap}
              className="w-full text-sm font-bold text-indigo-600 flex items-center justify-center hover:text-indigo-700 transition-colors disabled:text-slate-400"
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
                  {gapAnalysis ? 'View Gap Analysis & Simulator' : 'Run Deep Gap Analysis'}
                </>
              )}
            </button>
          </div>
        )}

        {/* Analysis Modal */}
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
                  <p className="text-sm text-indigo-600 font-medium">{job.role}</p>
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
              
              <div className="p-6 flex-grow flex flex-col bg-white">
                <SkillGapPanel 
                  matched_skills={gapAnalysis.matched_skills} 
                  missing_skills={gapAnalysis.missing_skills} 
                  job={job}
                  match_percentage={gapAnalysis.match_percentage}
                />

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <button 
                    onClick={() => setShowSimulator(!showSimulator)}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg flex justify-center items-center transition-all"
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
    </div>
  );
}
