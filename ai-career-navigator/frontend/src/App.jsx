// src/App.jsx - Main application layout and state management
import React, { useState, useEffect } from 'react';
import ResumeUpload from './components/ResumeUpload';
import JobDashboard from './components/JobDashboard';
import { fetchJobs } from './api/client';

function App() {
  const [jobs, setJobs] = useState([]);
  const [isMatched, setIsMatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAllJobs = async () => {
    setLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
      setIsMatched(false);
      setError(null);
    } catch (err) {
      setError("Failed to load available jobs. Ensure backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllJobs();
  }, []);

  const handleMatchesFound = (matchedJobs) => {
    setJobs(matchedJobs);
    setIsMatched(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="relative z-10">
        <header className="max-w-7xl mx-auto mb-16 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm">
            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">AI-Powered Recruiting</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight mb-6 pb-2">
            AI Career Navigator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Upload your resume and let our intelligent engine instantly match your skills with the perfect opportunities.
          </p>
        </header>

        <main className="max-w-7xl mx-auto space-y-12 relative">
          <ResumeUpload 
            onMatchesFound={handleMatchesFound} 
            onJobsReset={loadAllJobs} 
          />
          
          {error && (
            <div className="max-w-3xl mx-auto bg-red-50/90 backdrop-blur-sm border-l-4 border-red-500 p-5 rounded-r-xl shadow-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-bold text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative">
                <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-200"></div>
                <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-indigo-600 border-t-transparent"></div>
              </div>
            </div>
          ) : (
            !error && <JobDashboard jobs={jobs} isMatched={isMatched} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
