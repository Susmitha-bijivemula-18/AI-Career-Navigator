import React, { useState, useEffect, useCallback } from 'react';
import { fetchJobs, searchJobs } from '../api/jobsApi';
import JobCard from '../components/JobCard';
import SearchFilterBar from '../components/SearchFilterBar';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination and Filtering State
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({ query: '', role: '', location: '', experience: '' });
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 50;

  const loadJobs = useCallback(async (currentPage, currentFilters) => {
    try {
      setLoading(true);
      setError(null);
      let data = [];
      const skip = currentPage * PAGE_SIZE;

      if (currentFilters.query) {
        data = await searchJobs(currentFilters.query, skip, PAGE_SIZE);
      } else {
        const queryParams = { skip, limit: PAGE_SIZE };
        if (currentFilters.role) queryParams.role = currentFilters.role;
        if (currentFilters.location) queryParams.location = currentFilters.location;
        if (currentFilters.experience) queryParams.experience_level = currentFilters.experience;
        data = await fetchJobs(queryParams.skip, queryParams.limit, queryParams.role, queryParams.location, queryParams.experience_level);
      }

      const mappedJobs = data.map(job => ({
        ...job,
        company: job.company || job.company_name,
        job_apply_link: job.job_apply_link || job.apply_url || job.apply_link,
        company_careers_link: job.company_careers_link,
        required_skills: job.required_skills || job.skills_required || [],
      }));

      setJobs(mappedJobs);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error('JobsPage error:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs(page, filters);
  }, [page, filters, loadJobs]);

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page on new search
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (hasMore) setPage(page + 1);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Discover Opportunities</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Find the perfect role tailored for your skills and experience.
          </p>
        </div>

        <SearchFilterBar onSearch={handleSearch} />

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800 max-w-lg mx-auto">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            No jobs found matching your criteria. Try adjusting your filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            <div className="mt-12 flex justify-center items-center gap-4">
              <button 
                onClick={handlePrevPage}
                disabled={page === 0}
                className="px-6 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Page {page + 1}</span>
              <button 
                onClick={handleNextPage}
                disabled={!hasMore}
                className="px-6 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
