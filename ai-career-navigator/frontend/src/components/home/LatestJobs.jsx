import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconMapPin, IconClock, IconBriefcase } from '@tabler/icons-react';

export default function JobsSection() {
  const navigate = useNavigate();

  const jobs = [
    {
      id: 1,
      role: "Senior AI Engineer",
      company: "Amazon",
      location: "San Francisco, CA",
      time: "2 hours ago",
      type: "Full-time",
      logo: "https://www.google.com/s2/favicons?sz=128&domain=amazon.com"
    },
    {
      id: 2,
      role: "Machine Learning Scientist",
      company: "Google",
      location: "Remote",
      time: "5 hours ago",
      type: "Full-time",
      logo: "https://www.google.com/s2/favicons?sz=128&domain=google.com"
    },
    {
      id: 3,
      role: "Full Stack Developer",
      company: "Microsoft",
      location: "New York, NY",
      time: "1 day ago",
      type: "Contract",
      logo: "https://www.google.com/s2/favicons?sz=128&domain=microsoft.com"
    },
    {
      id: 4,
      role: "Data Analyst",
      company: "TCS",
      location: "Chicago, IL",
      time: "2 days ago",
      type: "Full-time",
      logo: "https://www.google.com/s2/favicons?sz=128&domain=tcs.com"
    }
  ];

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm p-2">
                    <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{job.role}</h3>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{job.company}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                  {job.type}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                <div className="flex items-center gap-1.5">
                  <IconMapPin className="w-4 h-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <IconClock className="w-4 h-4" />
                  {job.time}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <IconBriefcase className="w-4 h-4" />
                  Active hiring
                </div>
                <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
