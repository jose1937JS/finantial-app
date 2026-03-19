import { useQuery } from '@tanstack/react-query';
import { LoanService } from '../../api/services/loan.service';

export const LOAN_KEYS = {
  all: ['loans'] as const,
  detail: (id: number) => ['loan', id] as const,
};

export const useLoans = () => {
  return useQuery({
    queryKey: LOAN_KEYS.all,
    queryFn: LoanService.getAllLoans,
  });
};

export const useLoanDetail = (id: number) => {
  return useQuery({
    queryKey: LOAN_KEYS.detail(id),
    queryFn: () => LoanService.getLoanDetail(id),
    enabled: !!id,
  });
};
