import { CreateRateDto, Rate } from '../../types/api';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export const RateService = {
  getAll: async (): Promise<Rate[]> => {
    const response = await apiClient.get(API_ENDPOINTS.RATE.GET_ALL);
    return response.data.data;
  },
  create: async (data: CreateRateDto): Promise<Rate> => {
    const response = await apiClient.post(API_ENDPOINTS.RATE.CREATE, data);
    return response.data.data;
  },
  update: async (id: number, data: Partial<Rate>): Promise<Rate> => {
    const response = await apiClient.patch(API_ENDPOINTS.RATE.UPDATE(id), data);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    const response = await apiClient.delete(API_ENDPOINTS.RATE.DELETE(id));
    return response.data.data;
  },
};
