import { useQueryData } from "@/hooks/useQueryData";
import { useMutationData } from "@/hooks/useMutationData";
import api from "@/lib/api";
import { API_CONFIG } from "@/lib/config";
import {
  ApiResponse,
  LoginRequest,
  PasswordResetRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  User
} from "@/types/index.types";

// Register user
export const useRegisterUser = (onSuccess?: () => void) => {
  return useMutationData(
    ['register'],
    async (data: RegisterRequest) => {
      try {
        const response = await api.post(API_CONFIG.AUTH.REGISTER, data);
        return {
          status: response.status,
          data: response.data.message,
          userId: response.data.userId,
        };
      } catch (error: any) {
        if (error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Registration failed',
          };
        }
        throw error;
      }
    },
    'users',
    onSuccess
  );
};

// Verify email
export const useVerifyEmail = (token: string) => {
  return useQueryData(
    ['verifyEmail', token],
    async () => {
      try {
        const response = await api.get(`${API_CONFIG.AUTH.VERIFY_EMAIL}/${token}`);
        return response.data;
      } catch (error: any) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Verification failed');
        }
        throw error;
      }
    }
  );
};

// Login user
export const useLoginUser = (onSuccess?: () => void) => {
  return useMutationData<LoginRequest, ApiResponse<string>>(
    ['login'],
    async (data: LoginRequest) => {
      try {
        const response = await api.post(API_CONFIG.AUTH.LOGIN, data);

        // Store token in localStorage
        localStorage.setItem('authToken', response.data.token);

        // Store user info
        localStorage.setItem('user', JSON.stringify({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          isVerified: response.data.user.isVerified,
        }));

        return {
          status: response.status,
          data: response.data.message,
          user: response.data.user,
        };
      } catch (error: any) {
        if (error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Login failed',
            needsVerification: error.response.data.needsVerification,
          };
        }
        throw error;
      }
    },
    'currentUser',
    onSuccess
  );
};

// Request password reset
export const useRequestPasswordReset = (onSuccess?: () => void) => {
  return useMutationData(
    ['requestPasswordReset'],
    async (data: PasswordResetRequest) => {
      try {
        const response = await api.post(API_CONFIG.AUTH.FORGOT_PASSWORD, data);
        return {
          status: response.status,
          data: response.data.message,
        };
      } catch (error: any) {
        if (error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Password reset request failed',
          };
        }
        throw error;
      }
    },
    undefined,
    onSuccess
  );
};

// Reset password
export const useResetPassword = (token: string, onSuccess?: () => void) => {
  return useMutationData(
    ['resetPassword', token],
    async (data: ResetPasswordRequest) => {
      try {
        const response = await api.post(`${API_CONFIG.AUTH.RESET_PASSWORD}/${token}`, data);
        return {
          status: response.status,
          data: response.data.message,
        };
      } catch (error: any) {
        if (error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Password reset failed',
          };
        }
        throw error;
      }
    },
    undefined,
    onSuccess
  );
};

// Resend verification email
export const useResendVerification = (onSuccess?: () => void) => {
  return useMutationData(
    ['resendVerification'],
    async (data: ResendVerificationRequest) => {
      try {
        const response = await api.post(API_CONFIG.AUTH.RESEND_VERIFICATION, data);
        return {
          status: response.status,
          data: response.data.message,
        };
      } catch (error: any) {
        if (error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Failed to resend verification email',
          };
        }
        throw error;
      }
    },
    undefined,
    onSuccess
  );
};

// Check if user is logged in
export const useCurrentUser = () => {
  return useQueryData<User | null>(
    ['currentUser'],
    async () => {
      try {
        // Attempt to get current user from the cookie-based endpoint
        const response = await api.get(API_CONFIG.AUTH.CURRENT_USER);
        return response.data.user;
      } catch (cookieError) {
        // If cookie-based auth fails, try token-based auth as fallback
        try {
          // Check if we have a token
          const token = localStorage.getItem('authToken');
          if (!token) return null;

          // Try to verify token is valid
          const tokenResponse = await api.get(API_CONFIG.AUTH.ME);
          return tokenResponse.data.user;
        } catch (tokenError) {
          // If both auth methods fail, clear token and user info
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          return null;
        }
      }
    }
  );
};

// Logout user
export const useLogout = (onSuccess?: () => void) => {
  return useMutationData(
    ['logout'],
    async () => {
      try {
        // Call logout endpoint to clear cookie
        const response = await api.post(API_CONFIG.AUTH.LOGOUT);

        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        return {
          status: response.status,
          data: response.data.message,
        };
      } catch (error: any) {
        if (error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Logout failed',
          };
        }
        throw error;
      }
    },
    'currentUser',
    onSuccess
  );
};

// Update user profile
export const useUpdateProfile = (onSuccess?: () => void) => {
  return useMutationData(
    ['updateProfile'],
    async (data: { name?: string }) => {
      try {
        const response = await api.patch(API_CONFIG.AUTH.UPDATE_PROFILE, data);

        // Update user info in localStorage
        const currentUser = localStorage.getItem('user');
        if (currentUser) {
          const userObj = JSON.parse(currentUser);
          localStorage.setItem('user', JSON.stringify({
            ...userObj,
            name: data.name || userObj.name,
          }));
        }

        return {
          status: response.status,
          data: response.data.message,
          user: response.data.user,
        };
      } catch (error: any) {
        if (error.response) {
          return {
            status: error.response.status,
            data: error.response.data.message || 'Profile update failed',
          };
        }
        throw error;
      }
    },
    'currentUser',
    onSuccess
  );
};
