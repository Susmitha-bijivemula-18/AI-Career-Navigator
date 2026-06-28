import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';

import ProtectedRoute from '../components/auth/ProtectedRoute';

// Lazy load Pages
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const JobsPage = React.lazy(() => import('../pages/JobsPage'));
const JobDetailsPage = React.lazy(() => import('../pages/JobDetailsPage'));
const ApplicationTrackerPage = React.lazy(() => import('../pages/ApplicationTrackerPage'));

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage mode="login" />} />
      <Route path="/signup" element={<LoginPage mode="signup" />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <DashboardPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tracker" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <ApplicationTrackerPage />
            </Suspense>
          </ProtectedRoute>
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
      <Route 
        path="/jobs/:id" 
        element={
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <JobDetailsPage />
          </Suspense>
        } 
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
