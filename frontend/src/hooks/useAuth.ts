import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import api from '@/lib/api';

interface AuthState {
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
}

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        token: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Check token and auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setAuthState({
                        isAuthenticated: false,
                        user: null,
                        token: null,
                    });
                    setIsLoading(false);
                    return;
                }

                // Set token on auth state
                setAuthState(prev => ({
                    ...prev,
                    token,
                    isAuthenticated: true,
                }));

                // Try to get user profile to verify token is still valid
                try {
                    const response = await api.get('/api/auth/me');
                    setAuthState({
                        isAuthenticated: true,
                        user: response.data,
                        token,
                    });
                } catch (error) {
                    // Token is invalid, clear auth state
                    logout();
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            const { token, user } = response.data;

            // Save token to localStorage
            localStorage.setItem('token', token);

            // Update auth state
            setAuthState({
                isAuthenticated: true,
                user,
                token,
            });

            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }, []);

    // Logout function
    const logout = useCallback(() => {
        // Clear token from localStorage
        localStorage.removeItem('token');

        // Reset auth state
        setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
        });

        // Redirect to login page
        const from = location.pathname;
        navigate('/auth/login', { state: { from } });
    }, [navigate, location]);

    return {
        ...authState,
        isLoading,
        login,
        logout,
    };
}; 