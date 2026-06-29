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
const ApplicationsDashboard = React.lazy(() => import('../pages/ApplicationsDashboard/index'));
const ApplicationDetails = React.lazy(() => import('../pages/ApplicationDetails/index'));
const SavedJobsPage = React.lazy(() => import('../pages/SavedJobsPage'));

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
        path="/applications" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <ApplicationsDashboard />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/applications/:id" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <ApplicationDetails />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/jobs" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <JobsPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/jobs/:id" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <JobDetailsPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/saved-jobs" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <SavedJobsPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
