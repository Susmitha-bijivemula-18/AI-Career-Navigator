import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind class merging
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const statusColors = {
  'Saved': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  'Applied': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Under Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Online Assessment': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  'Interview Scheduled': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Technical Interview': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
  'Managerial Interview': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  'HR Interview': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Selected': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Offer Received': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

export const StatusBadge = ({ status, className }) => {
  const colorClass = statusColors[status] || statusColors['Saved'];

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      colorClass,
      className
    )}>
      {status}
    </span>
  );
};
