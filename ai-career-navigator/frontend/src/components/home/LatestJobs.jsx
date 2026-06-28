import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconMapPin, IconClock, IconBriefcase, IconBuilding } from '@tabler/icons-react';
import { fetchJobs } from '../../api/jobsApi';

export default function JobsSection() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await fetchJobs(0, 4);
        setJobs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  return (
    <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300" id="jobs-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Explore Jobs</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Discover roles matching your skills and experience.</p>
          </div>
          <button 
            onClick={() => navigate('/jobs')}
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center"
          >
            View all jobs
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-slate-500 py-10">No jobs found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {jobs.map((job) => {
              const companyName = job.company || job.company_name;
              const domain = companyName ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : null;
              
              return (
                <div key={job.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm p-2 shrink-0">
                          <img 
                            src={`https://icon.horse/icon/${domain}`} 
                            alt={companyName} 
                            className="w-full h-full object-contain" 
                            onError={(e) => {
                              if (e.target.src.includes('icon.horse')) {
                                e.target.src = `https://ui-avatars.com/api/?name=${companyName || 'C'}&background=e0e7ff&color=4f46e5`;
                              }
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">{job.role}</h3>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <IconBuilding size={16} />
                            {companyName}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shrink-0 ml-2">
                        {job.employment_type || 'Full-time'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                      <div className="flex items-center gap-1.5">
                        <IconMapPin className="w-4 h-4" />
                        <span className="truncate max-w-[120px]">{job.location || 'Remote'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <IconClock className="w-4 h-4" />
                        {new Date(job.posted_time || job.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <IconBriefcase className="w-4 h-4" />
                      Active hiring
                    </div>
                    <button 
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
