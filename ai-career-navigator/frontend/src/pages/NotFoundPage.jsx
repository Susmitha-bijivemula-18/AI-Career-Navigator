import React from 'react';
import { Link } from 'react-router-dom';
import { IconAlertTriangle } from '@tabler/icons-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      <IconAlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-6 text-center">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-colors"
      >
        Go back home
      </Link>
    </div>
  );
}
