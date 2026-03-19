import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { Rate, CreateRateDto } from '../../types/api';

export const RateService = {
  getAll: async (): Promise<Rate[]> => {
    const response = await apiClient.get(API_ENDPOINTS.RATE.GET_ALL);
    return response.data;
  },
  create: async (data: CreateRateDto): Promise<Rate> => {
    const response = await apiClient.post(API_ENDPOINTS.RATE.CREATE, data);
    return response.data;
  },
  update: async (id: number, data: Partial<Rate>): Promise<Rate> => {
    const response = await apiClient.patch(API_ENDPOINTS.RATE.UPDATE(id), data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    const response = await apiClient.delete(API_ENDPOINTS.RATE.DELETE(id));
    return response.data;
  },
};
