import { useQuery } from '@tanstack/react-query';
import { TransactionService } from '../../api/services/transaction.service';

export const TRANSACTION_KEYS = {
  all: ['transactions'] as const,
  initialData: ['transactions', 'initial-data'] as const,
  detail: (id: number) => ['transaction', id] as const,
};

export const useTransactions = () => {
  return useQuery({
    queryKey: TRANSACTION_KEYS.all,
    queryFn: TransactionService.getAll,
  });
};

export const useTransactionInitialData = () => {
  return useQuery({
    queryKey: TRANSACTION_KEYS.initialData,
    queryFn: TransactionService.getInitialData,
  });
};

export const useTransaction = (id: number) => {
  return useQuery({
    queryKey: TRANSACTION_KEYS.detail(id),
    queryFn: () => TransactionService.getOne(id),
    enabled: !!id,
  });
};
