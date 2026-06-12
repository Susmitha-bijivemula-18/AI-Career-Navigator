// src/components/JobDashboard.jsx - Grid layout of JobCard components
import React from 'react';
import JobCard from './JobCard';

export default function JobDashboard({ jobs, isMatched }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-16 glass-card rounded-[2rem] max-w-4xl mx-auto border-dashed border-2 border-gray-300 bg-white/40">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-5 shadow-inner">
          <svg className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No jobs found</h3>
        <p className="text-base font-medium text-gray-500 max-w-sm mx-auto">
          Upload your resume to see matches, or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          {isMatched ? 'Your Match Results' : 'Available Jobs'}
          {isMatched && <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>}
        </h2>
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-white border border-gray-200 shadow-sm text-gray-700">
          <span className="text-indigo-600 mr-1.5">{jobs.length}</span> roles found
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
