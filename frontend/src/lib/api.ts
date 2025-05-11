import axios from 'axios';
import { API_CONFIG } from './config';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enables sending cookies with requests
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            // Clear token if it exists - the user is no longer authenticated
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');

            // Don't redirect on API calls to check auth status
            if (!error.config.url.includes('/current-user') && !error.config.url.includes('/me')) {
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api; 