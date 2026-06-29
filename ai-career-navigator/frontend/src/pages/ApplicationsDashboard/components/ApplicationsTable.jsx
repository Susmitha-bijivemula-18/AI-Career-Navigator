import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronRight, MapPin, Building, Calendar } from 'lucide-react';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { EmptyState } from '../../../components/common/EmptyState';

export const ApplicationsTable = ({ applications, isLoading, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredApps = applications?.filter(app => {
    const job = app.jobs || {};
    const matchesSearch = (job.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (job.role?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? app.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Controls */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
            placeholder="Search company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm appearance-none"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                if (onFilterChange) onFilterChange({ status: e.target.value });
              }}
            >
              <option value="">All Statuses</option>
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Online Assessment">Online Assessment</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Rejected">Rejected</option>
              <option value="Selected">Selected</option>
              <option value="Offer Received">Offer Received</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading applications...</div>
        ) : filteredApps?.length > 0 ? (
          filteredApps.map((app) => {
            const job = app.jobs || {};
            const companyName = job.company_name || job.company || 'Unknown Company';
            const domain = companyName !== 'Unknown Company' ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : null;
            
            return (
              <Link 
                to={`/applications/${app.id}`} 
                key={app.id}
                className="group block hover:bg-gray-50 dark:hover:bg-gray-750 transition duration-150 ease-in-out"
              >
                <div className="px-6 py-5 flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <img 
                      className="h-12 w-12 rounded-lg object-contain border border-gray-200 dark:border-gray-600 bg-white" 
                      src={`https://icon.horse/icon/${domain}`} 
                      alt={companyName} 
                      onError={(e) => {
                        if (e.target.src.includes('icon.horse')) {
                          e.target.src = `https://ui-avatars.com/api/?name=${companyName}&background=e0e7ff&color=4f46e5`;
                        }
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{job.role || 'Unknown Role'}</h4>
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
                        <span className="flex items-center"><Building size={14} className="mr-1"/> {companyName}</span>
                        {job.location && <span className="flex items-center"><MapPin size={14} className="mr-1"/> {job.location}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end justify-center gap-2">
                      <StatusBadge status={app.status} />
                      <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Calendar size={12} className="mr-1" />
                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Unknown Date'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center gap-2">
                    <span className="hidden sm:block text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">Manage Application</span>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <EmptyState 
            title="No applications found" 
            description={searchTerm || statusFilter ? "Try adjusting your filters or search term." : "You haven't tracked any applications yet. Go to jobs and mark one as applied!"}
            action={!searchTerm && !statusFilter ? (
              <Link to="/jobs" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Browse Jobs
              </Link>
            ) : null}
          />
        )}
      </div>
    </div>
  );
};
