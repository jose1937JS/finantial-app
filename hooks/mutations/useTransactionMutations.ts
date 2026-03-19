import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionService } from '../../api/services/transaction.service';
import { CreateTransactionDto } from '../../types/api';
import { TRANSACTION_KEYS } from '../queries/useTransactionQueries';

export const useCreateTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionDto) => TransactionService.create(data),
    onSuccess: () => {
      // Invalidate queries so the lists refresh
      queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.initialData });
    },
  });
};

export const useDeleteTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => TransactionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.initialData });
    },
  });
};
