// src/api/client.js - Axios base config + API calls
import axios from 'axios';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post('/upload/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchJobs = async () => {
  const response = await client.get('/jobs');
  return response.data;
};

export const fetchJobMatches = async (skills) => {
  const response = await client.get(`/jobs/match?skills=${skills.join(',')}`);
  return response.data;
};
