// API configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        VERIFY_EMAIL: '/auth/verify',
        CURRENT_USER: '/auth/current-user',
        LOGOUT: '/auth/logout',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        RESEND_VERIFICATION: '/auth/resend-verification',
        ME: '/auth/me',
    },
    INTERVIEWS: {
        BASE: '/interviews',
        TRANSCRIPT: (id: string) => `/interviews/${id}/transcript`,
    },
    CANDIDATES: {
        BASE: '/candidates',
    },
}; 
