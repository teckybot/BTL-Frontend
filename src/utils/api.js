import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    // headers: {
    //     'Content-Type': 'application/json'
    // },
    timeout: 60000, // 10 second timeout

});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout');
            return Promise.reject(new Error('Request timed out. Please try again.'));
        }
        
        if (error.code === 'ECONNRESET') {
            console.error('Connection reset');
            return Promise.reject(new Error('Connection was reset. Please check your internet connection and try again.'));
        }

        if (!error.response) {
            console.error('Network error:', error);
            return Promise.reject(new Error('Network error. Please check your internet connection.'));
        }

        return Promise.reject(error);
    }
);

// Schools
// Paginated for dashboard only the first one
export const fetchSchools = (params) => api.get('/school/list', { params });
export const fetchSchoolStats = (params) => api.get('/school/stats', { params });

// Teams
// Paginated for dashboard only the first one
export const fetchTeams = (params) => api.get('/team/list', { params });
export const fetchTeamStats = (params) => api.get('/team/stats', { params });
export const qualifyTeam = (teamRegId) => api.patch(`/team/qualify/${teamRegId}`);

// Full export versions
export const fetchAllSchools = (params) => api.get('/school/list/all', { params });
export const fetchAllTeams = (params) => api.get('/team/list/all', { params });

export default api;