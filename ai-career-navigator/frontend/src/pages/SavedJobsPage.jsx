import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import JobCard from '../components/JobCard';
import { IconBookmark } from '@tabler/icons-react';

export default function SavedJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSavedJobs = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('saved_jobs')
        .select('*, jobs(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      
      const mappedJobs = (data || [])
        .filter(item => item && item.jobs && (Array.isArray(item.jobs) ? item.jobs.length > 0 : true)) 
        .map(item => {
        const job = Array.isArray(item.jobs) ? item.jobs[0] : item.jobs;
        return {
          ...job,
          company: job.company || job.company_name,
          job_apply_link: job.job_apply_link || job.apply_url || job.apply_link,
          company_careers_link: job.company_careers_link,
          required_skills: job.required_skills || job.skills_required || [],
        };
      });

      setJobs(mappedJobs);
    } catch (err) {
      console.error('SavedJobsPage error:', err);
      setError('Failed to load saved jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSavedJobs();
  }, [loadSavedJobs]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <IconBookmark size={32} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Saved Jobs</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Jobs you've saved for later. Apply when you're ready!
          </p>
        </div>

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
            You haven't saved any jobs yet. Go to the jobs page to explore!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
