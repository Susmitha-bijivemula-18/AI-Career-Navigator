import { client } from './client';

export const fetchJobs = async (skip = 0, limit = 50, role = '', location = '') => {
    try {
        const response = await client.get(`/jobs/`, {
            params: {
                skip,
                limit,
                ...(role && { role }),
                ...(location && { location })
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
    }
};
