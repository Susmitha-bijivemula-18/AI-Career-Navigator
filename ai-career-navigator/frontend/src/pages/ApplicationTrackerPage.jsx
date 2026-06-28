import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import { IconBriefcase, IconBookmark, IconClock, IconMapPin, IconBuilding, IconExternalLink } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function ApplicationTrackerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('applied'); // 'applied' or 'saved'
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirectTo=/tracker');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Applied Jobs
        const { data: applications, error: appError } = await supabase
          .from('applications')
          .select(`
            id, applied_at, status,
            jobs ( id, role, company_name, location, employment_type, company_logo, source )
          `)
          .eq('user_id', user.id)
          .order('applied_at', { ascending: false });
          
        if (appError) throw appError;

        // Fetch Saved Jobs
        const { data: saved, error: savedError } = await supabase
          .from('saved_jobs')
          .select(`
            id, saved_at,
            jobs ( id, role, company_name, location, employment_type, company_logo, source )
          `)
          .eq('user_id', user.id)
          .order('saved_at', { ascending: false });

        if (savedError) throw savedError;

        setAppliedJobs(applications || []);
        setSavedJobs(saved || []);
      } catch (err) {
        console.error("Error fetching tracker data:", err);
        setError("Failed to load your tracked jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const removeSavedJob = async (id, e) => {
    e.stopPropagation();
    try {
      await supabase.from('saved_jobs').delete().eq('id', id);
      setSavedJobs(prev => prev.filter(job => job.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const currentList = activeTab === 'applied' ? appliedJobs : savedJobs;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <IconBriefcase className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            Job Tracker
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Manage your applications and saved opportunities.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8">
          <button
            onClick={() => setActiveTab('applied')}
            className={`pb-4 px-6 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'applied'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <IconBriefcase size={18} />
            Applied Jobs ({appliedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-4 px-6 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'saved'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <IconBookmark size={18} />
            Saved Jobs ({savedJobs.length})
          </button>
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800">
            {error}
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'applied' ? <IconBriefcase size={32} className="text-slate-400" /> : <IconBookmark size={32} className="text-slate-400" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No {activeTab === 'applied' ? 'applications' : 'saved jobs'} yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              When you {activeTab === 'applied' ? 'apply to' : 'save'} jobs, they will appear here.
            </p>
            <button 
              onClick={() => navigate('/jobs')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {currentList.map((item) => {
              const job = item.jobs;
              if (!job) return null; // Handle if job was deleted
              
              const domain = job.company_name ? `${job.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : null;
              const date = new Date(activeTab === 'applied' ? item.applied_at : item.saved_at).toLocaleDateString();

              return (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 flex items-center justify-center p-2 shrink-0">
                      <img 
                        src={`https://icon.horse/icon/${domain}`} 
                        alt={job.company_name} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${job.company_name}&background=e0e7ff&color=4f46e5`;
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {job.role}
                      </h3>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                        <IconBuilding size={16} />
                        {job.company_name}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <IconMapPin size={14} /> {job.location || 'Remote'}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconClock size={14} /> {activeTab === 'applied' ? 'Applied' : 'Saved'} on {date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {activeTab === 'applied' ? (
                      <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800">
                        {item.status.toUpperCase()}
                      </span>
                    ) : (
                      <button 
                        onClick={(e) => removeSavedJob(item.id, e)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove from saved"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    <IconExternalLink size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
