import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';

// Lazy load Pages
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const JobsPage = React.lazy(() => import('../pages/JobsPage'));

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage mode="login" />} />
      <Route path="/signup" element={<LoginPage mode="signup" />} />
      <Route 
        path="/dashboard" 
        element={
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <DashboardPage />
          </Suspense>
        } 
      />
      <Route 
        path="/jobs" 
        element={
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <JobsPage />
          </Suspense>
        } 
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
