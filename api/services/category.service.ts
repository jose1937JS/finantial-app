import { Category, CreateCategoryDto } from '../../types/api';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export const CategoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORY.GET_ALL);
    return response.data.data;
  },
  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post(API_ENDPOINTS.CATEGORY.CREATE, data);
    return response.data.data;
  },
  getByUser: async (): Promise<Category[]> => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORY.GET_BY_USER);
    return response.data.data;
  },
  getOne: async (id: number): Promise<Category> => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORY.GET_ONE(id));
    return response.data.data;
  },
  update: async (id: number, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.patch(API_ENDPOINTS.CATEGORY.UPDATE(id), data);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    const response = await apiClient.delete(API_ENDPOINTS.CATEGORY.DELETE(id));
    return response.data.data;
  },
};
