import React from 'react';
import { Briefcase, Clock, Calendar, XCircle, CheckCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

export const StatCards = ({ stats }) => {
  if (!stats) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <StatCard 
        title="Total Applications" 
        value={stats.total_applications || 0} 
        icon={Briefcase} 
        colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      />
      <StatCard 
        title="Under Review" 
        value={stats.under_review || 0} 
        icon={Clock} 
        colorClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
      />
      <StatCard 
        title="Interviews" 
        value={stats.interviews_scheduled || 0} 
        icon={Calendar} 
        colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
      />
      <StatCard 
        title="Offers" 
        value={stats.offers_received || 0} 
        icon={CheckCircle} 
        colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
      />
      <StatCard 
        title="Rejected" 
        value={stats.rejected || 0} 
        icon={XCircle} 
        colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
      />
    </div>
  );
};
