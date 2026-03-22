import { CreateLoanDto, LoanPaymentDto } from '../../types/api';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export const LoanService = {
  getAllLoans: async (): Promise<any[]> => {
    const response = await apiClient.get(API_ENDPOINTS.LOAN.GET_ALL);
    return response.data.data;
  },
  createLoan: async (data: CreateLoanDto): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.LOAN.CREATE, data);
    return response.data.data;
  },
  getLoanDetail: async (id: number): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.LOAN.GET_DETAIL(id));
    return response.data.data;
  },
  registerPayment: async (id: number, data: LoanPaymentDto): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.LOAN.REGISTER_PAYMENT(id), data);
    return response.data.data;
  },
};
