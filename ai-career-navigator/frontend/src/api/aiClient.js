// frontend/src/api/aiClient.js
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

const post = async (url, data) => {
  const response = await client.post(url, data);
  return response.data;
};

const get = async (url) => {
  const response = await client.get(url);
  return response.data;
};

export const analyzeResume = (text) => post('/analyze/resume', { resume_text: text });
export const getGapAnalysis = (resumeSkills, jobId) => post('/gap-analysis', { resume_skills: resumeSkills, job_id: jobId });
export const getSuggestions = (resumeSkills, experienceLevel, targetRoles) => post('/suggest', { resume_skills: resumeSkills, experience_level: experienceLevel, target_roles: targetRoles });
export const simulateMatch = (jobId, currentSkills, skillsToAdd) => post('/simulate/match', { job_id: jobId, current_skills: currentSkills, skills_to_add: skillsToAdd });
export const getRecommend = (id) => get(`/recommend?resume_id=${id}`);

export const aiClient = {
  analyzeResume,
  getGapAnalysis,
  getSuggestions,
  simulateMatch,
  getRecommendations: getRecommend
};
