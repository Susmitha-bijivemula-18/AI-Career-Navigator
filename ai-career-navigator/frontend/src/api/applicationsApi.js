import { client } from './client';
import { supabase } from './supabase';

// Helper to get headers with the auth token
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    headers: {
      Authorization: `Bearer ${session?.access_token || ''}`,
      'user-id': session?.user?.id || '' // Fallback since our backend expects this header for now
    }
  };
};

export const createApplication = async (applicationData) => {
  const options = await getAuthHeaders();
  const response = await client.post('/applications', applicationData, options);
  return response.data;
};

export const fetchApplications = async (filters = {}) => {
  const options = await getAuthHeaders();
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  
  const response = await client.get(`/applications?${params.toString()}`, options);
  return response.data;
};

export const fetchApplicationById = async (id) => {
  const options = await getAuthHeaders();
  const response = await client.get(`/applications/${id}`, options);
  return response.data;
};

export const updateApplication = async (id, updateData) => {
  const options = await getAuthHeaders();
  const response = await client.patch(`/applications/${id}`, updateData, options);
  return response.data;
};

export const deleteApplication = async (id) => {
  const options = await getAuthHeaders();
  const response = await client.delete(`/applications/${id}`, options);
  return response.data;
};

export const fetchDashboardStats = async () => {
  const options = await getAuthHeaders();
  const response = await client.get('/applications/dashboard/stats', options);
  return response.data;
};
