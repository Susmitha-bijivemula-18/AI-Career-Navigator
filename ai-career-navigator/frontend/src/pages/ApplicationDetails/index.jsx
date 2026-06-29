import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchApplicationById, updateApplication } from '../../api/applicationsApi';
import { StatusUpdater } from './components/StatusUpdater';
import { NotesEditor } from './components/NotesEditor';
import { TimelineTracker } from './components/TimelineTracker';
import { ArrowLeft, Building, MapPin, ExternalLink } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export default function ApplicationDetails() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    setIsLoading(true);
    try {
      const data = await fetchApplicationById(id);
      setApplication(data);
    } catch (error) {
      console.error("Failed to load application:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateApplication(id, { status: newStatus });
      loadApplication(); // Reload to get new timeline and updated status
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleNotesSave = async (newNotes) => {
    try {
      await updateApplication(id, { notes: newNotes });
      setApplication(prev => ({ ...prev, notes: newNotes }));
    } catch (error) {
      console.error("Failed to save notes:", error);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Application Not Found</h2>
          <Link to="/applications" className="text-blue-600 hover:underline">Back to applications</Link>
        </div>
      </div>
    );
  }

  const job = application.jobs || {};
  const companyName = job.company_name || job.company || 'Unknown Company';
  const domain = companyName !== 'Unknown Company' ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : null;

  return (
    <div className="min-w-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div className="mb-4">
          <Link to="/applications" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="flex-shrink-0">
            <img 
              className="h-24 w-24 rounded-xl object-contain border border-gray-200 dark:border-gray-600 bg-white" 
              src={`https://icon.horse/icon/${domain}`} 
              alt={companyName}
              onError={(e) => {
                if (e.target.src.includes('icon.horse')) {
                  e.target.src = `https://ui-avatars.com/api/?name=${companyName}&background=e0e7ff&color=4f46e5`;
                }
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{job.role || 'Unknown Role'}</h1>
                <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
                  <span className="flex items-center"><Building size={16} className="mr-1"/> {companyName}</span>
                  {job.location && <span className="flex items-center"><MapPin size={16} className="mr-1"/> {job.location}</span>}
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                <StatusBadge status={application.status} className="text-sm px-3 py-1" />
                {job.job_apply_link && (
                  <a href={job.job_apply_link} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 mt-2 sm:mt-0">
                    <ExternalLink size={14} className="mr-1" /> View Original Job Post
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <NotesEditor initialNotes={application.notes} onSave={handleNotesSave} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <StatusUpdater currentStatus={application.status} onStatusChange={handleStatusChange} />
            <TimelineTracker timeline={application.application_timeline} />
          </div>
        </div>

      </div>
    </div>
  );
}
