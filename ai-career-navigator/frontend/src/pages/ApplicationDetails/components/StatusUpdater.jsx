import React from 'react';
import { StatusBadge } from '../../../components/common/StatusBadge';

const STATUSES = [
  'Saved',
  'Applied',
  'Under Review',
  'Online Assessment',
  'Interview Scheduled',
  'Technical Interview',
  'Managerial Interview',
  'HR Interview',
  'Rejected',
  'Selected',
  'Offer Received'
];

export const StatusUpdater = ({ currentStatus, onStatusChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Status</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current:</span>
        <StatusBadge status={currentStatus} />
      </div>

      <div className="mt-4">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Change to</label>
        <select
          id="status"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          value={currentStatus || ''}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
