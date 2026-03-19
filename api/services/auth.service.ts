import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../../types/api';

export const AuthService = {
  register: async (data: RegisterDto) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },
  login: async (data: LoginDto) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data; // Usually contains a token
  },
  forgotPassword: async (data: ForgotPasswordDto) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    return response.data;
  },
  resetPassword: async (data: ResetPasswordDto) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return response.data;
  },
};
