import axiosInstance from '../axios';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'PARTICIPANT';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface MessageResponse {
  message: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<MessageResponse> => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailData): Promise<MessageResponse> => {
    const response = await axiosInstance.post('/auth/verify-email', data);
    return response.data;
  },

  resendVerification: async (email: string): Promise<MessageResponse> => {
    const response = await axiosInstance.post('/auth/resend-verification', { email });
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<MessageResponse> => {
    const response = await axiosInstance.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData): Promise<MessageResponse> => {
    const response = await axiosInstance.post('/auth/reset-password', data);
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },
};
