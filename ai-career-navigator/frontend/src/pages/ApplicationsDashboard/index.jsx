import React, { useEffect, useState } from 'react';
import { StatCards } from './components/StatCards';
import { DashboardCharts } from './components/DashboardCharts';
import { ApplicationsTable } from './components/ApplicationsTable';
import { fetchApplications, fetchDashboardStats } from '../../api/applicationsApi';
import { Briefcase } from 'lucide-react';

export default function ApplicationsDashboard() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (filters = {}) => {
    setIsLoading(true);
    try {
      const [statsData, appsData] = await Promise.all([
        fetchDashboardStats(),
        fetchApplications(filters)
      ]);
      setStats(statsData);
      setApplications(appsData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (filters) => {
    loadData(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="text-blue-600 dark:text-blue-400" />
              My Applications
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Track and manage your job application journey.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <StatCards stats={stats} />

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Applications List (Left) */}
          <div className="w-full lg:w-2/3 xl:w-3/4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application History</h3>
            <ApplicationsTable 
              applications={applications} 
              isLoading={isLoading} 
              onFilterChange={handleFilterChange} 
            />
          </div>

          {/* Status Chart (Right - Sticky) */}
          <div className="w-full lg:w-1/3 xl:w-1/4 sticky top-24">
            <DashboardCharts stats={stats} />
          </div>

        </div>

      </div>
    </div>
  );
}
