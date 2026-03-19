import { useMutation } from '@tanstack/react-query';
import { AuthService } from '../../api/services/auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../../types/api';

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data: RegisterDto) => AuthService.register(data),
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: LoginDto) => AuthService.login(data),
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) => AuthService.forgotPassword(data),
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordDto) => AuthService.resetPassword(data),
  });
};
