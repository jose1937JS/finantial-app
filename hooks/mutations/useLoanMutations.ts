import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoanService } from '../../api/services/loan.service';
import { CreateLoanDto, LoanPaymentDto } from '../../types/api';
import { LOAN_KEYS } from '../queries/useLoanQueries';

export const useCreateLoanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoanDto) => LoanService.createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOAN_KEYS.all });
    },
  });
};

export const useRegisterPaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LoanPaymentDto }) => LoanService.registerPayment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LOAN_KEYS.all });
      queryClient.invalidateQueries({ queryKey: LOAN_KEYS.detail(variables.id) });
    },
  });
};
