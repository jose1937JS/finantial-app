import { UpdateUserDto, User } from '../../types/api';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export const UserService = {
  getOne: async (id: number): Promise<User> => {
    const response = await apiClient.get(API_ENDPOINTS.USER.GET_ONE(id));
    return response.data.data;
  },
  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch(API_ENDPOINTS.USER.UPDATE(id), data);
    return response.data.data;
  },
  delete: async (id: number): Promise<void> => {
    const response = await apiClient.delete(API_ENDPOINTS.USER.DELETE(id));
    return response.data.data;
  },
};
