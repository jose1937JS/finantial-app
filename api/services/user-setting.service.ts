import { UpsertSettingDto, UserSetting } from '../../types/api';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export const UserSettingService = {
  getAll: async (): Promise<UserSetting[]> => {
    const response = await apiClient.get(API_ENDPOINTS.USER_SETTING.GET_ALL);
    return response.data.data;
  },
  upsert: async (data: UpsertSettingDto): Promise<UserSetting> => {
    const response = await apiClient.put(API_ENDPOINTS.USER_SETTING.UPSERT, data);
    return response.data.data;
  },
};
