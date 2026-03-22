import { CreateNotificationDto, Notification } from '../../types/api';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export const NotificationService = {
  getAll: async (): Promise<Notification[]> => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATION.GET_ALL);
    return response.data.data;
  },
  create: async (data: CreateNotificationDto): Promise<Notification> => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATION.CREATE, data);
    return response.data.data;
  },
  markAllAsRead: async (): Promise<void> => {
    const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATION.READ_ALL);
    return response.data.data;
  },
};
