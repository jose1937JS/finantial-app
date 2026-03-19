import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export const ChartService = {
  getIncomeExpense: async (): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.CHART.INCOME_EXPENSE);
    return response.data;
  },
  getExpensesByCategory: async (): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.CHART.EXPENSES_BY_CATEGORY);
    return response.data;
  },
  getTimeline: async (range: string): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.CHART.TIMELINE(range));
    return response.data;
  },
};
