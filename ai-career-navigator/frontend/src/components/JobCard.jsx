// src/components/JobCard.jsx - single job match card
import React from 'react';

export default function JobCard({ job }) {
  let matchColor = 'text-gray-600 bg-gray-50 border-gray-200 shadow-sm';
  
  if (job.match_percentage !== undefined) {
    if (job.match_percentage < 40) {
      matchColor = 'text-red-700 bg-red-50 border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.25)]';
    } else if (job.match_percentage < 70) {
      matchColor = 'text-amber-700 bg-amber-50 border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]';
    } else {
      matchColor = 'text-green-700 bg-green-50 border-green-200 shadow-[0_0_15px_rgba(34,197,94,0.3)]';
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col h-full border border-gray-200 relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      <div className="p-7 flex-grow relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">{job.role}</h3>
            <p className="text-sm text-gray-500 font-bold mt-1.5">{job.company}</p>
          </div>
          
          {job.match_percentage !== undefined && (
            <div className={`px-4 py-1.5 rounded-2xl border flex items-center justify-center transition-transform duration-300 hover:scale-105 ${matchColor}`}>
              <span className="text-xl font-black">{job.match_percentage}%</span>
              <span className="text-xs ml-1.5 font-bold uppercase tracking-wider">Match</span>
            </div>
          )}
        </div>

        {job.matched_skills && job.matched_skills.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-extrabold text-gray-400 mb-2 uppercase tracking-widest">Matched Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.matched_skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm transition-colors hover:bg-emerald-100">
                  <span className="mr-1 text-emerald-500">✓</span> {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.missing_skills && job.missing_skills.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-extrabold text-gray-400 mb-2 uppercase tracking-widest">Missing Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.missing_skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-sm transition-colors hover:bg-rose-100">
                  <span className="mr-1 text-rose-500">✗</span> {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.required_skills && job.match_percentage === undefined && (
          <div className="mb-6">
            <p className="text-[10px] font-extrabold text-gray-400 mb-2 uppercase tracking-widest">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.required_skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-5 pt-0 mt-auto relative z-10">
        <a 
          href={job.apply_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transform transition-all duration-300 hover:shadow-indigo-500/30 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 group-hover:shadow-lg"
        >
          Apply Now →
        </a>
      </div>
    </div>
  );
}
