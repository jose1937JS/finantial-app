import { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from '../../types/api';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export const AuthService = {
  register: async (data: RegisterDto) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data.data;
  },
  login: async (data: LoginDto) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data.data;
  },
  forgotPassword: async (data: ForgotPasswordDto) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    return response.data.data;
  },
  resetPassword: async (data: ResetPasswordDto) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return response.data.data;
  },
};
