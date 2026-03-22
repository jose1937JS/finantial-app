import { CreateTransactionDto, Transaction } from '../../types/api';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export const TransactionService = {
  getAll: async (): Promise<Transaction[]> => {
    const response = await apiClient.get(API_ENDPOINTS.TRANSACTION.GET_ALL);
    return response.data.data;
  },
  create: async (data: CreateTransactionDto): Promise<Transaction> => {
    const response = await apiClient.post(API_ENDPOINTS.TRANSACTION.CREATE, data);
    return response.data.data;
  },
  getInitialData: async (): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.TRANSACTION.GET_INITIAL_DATA);
    return response.data.data;
  },
  getOne: async (id: number): Promise<Transaction> => {
    const response = await apiClient.get(API_ENDPOINTS.TRANSACTION.GET_ONE(id));
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    const response = await apiClient.delete(API_ENDPOINTS.TRANSACTION.DELETE(id));
    return response.data.data;
  },
};
