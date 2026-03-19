import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { CreateLoanDto, LoanPaymentDto } from '../../types/api';

export const LoanService = {
  getAllLoans: async (): Promise<any[]> => {
    const response = await apiClient.get(API_ENDPOINTS.LOAN.GET_ALL);
    return response.data;
  },
  createLoan: async (data: CreateLoanDto): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.LOAN.CREATE, data);
    return response.data;
  },
  getLoanDetail: async (id: number): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.LOAN.GET_DETAIL(id));
    return response.data;
  },
  registerPayment: async (id: number, data: LoanPaymentDto): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.LOAN.REGISTER_PAYMENT(id), data);
    return response.data;
  },
};
