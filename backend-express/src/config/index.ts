import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Server configuration
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

    // JWT configuration
    jwtSecret: process.env.JWT_SECRET || 'fallback_secret_for_development_only',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',

    // Email configuration
    email: {
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
        from: process.env.EMAIL_FROM || 'no-reply@example.com',
    }
}; 