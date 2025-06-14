import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000, // 10 second timeout
    withCredentials: true
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

export default api;