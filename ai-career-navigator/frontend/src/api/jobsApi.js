import { client } from './client';

export const fetchJobs = async (skip = 0, limit = 50, role = '', location = '', experience_level = '') => {
    try {
        const response = await client.get(`/jobs/`, {
            params: {
                skip,
                limit,
                ...(role && { role }),
                ...(location && { location }),
                ...(experience_level && { experience_level })
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
    }
};

export const searchJobs = async (q = '', skip = 0, limit = 50) => {
    try {
        const response = await client.get(`/jobs/search`, {
            params: {
                q,
                skip,
                limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching jobs:', error);
        throw error;
    }
};

export const fetchJobById = async (jobId) => {
    try {
        const response = await client.get(`/jobs/${jobId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching job ${jobId}:`, error);
        throw error;
    }
};
