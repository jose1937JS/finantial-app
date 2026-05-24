import { CreateJobDto, CreateJobPaymentDto, JobDetail, JobPayment, JobSummary } from '../../types/api';
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export const JobService = {
  getAll: async (): Promise<JobSummary[]> => {
    const response = await apiClient.get(API_ENDPOINTS.JOB.GET_ALL, {
      params: { _t: Date.now() },
    });
    return response.data.data;
  },
  create: async (data: CreateJobDto): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.JOB.CREATE, data);
    return response.data.data;
  },
  getOne: async (id: number): Promise<JobDetail> => {
    const response = await apiClient.get(API_ENDPOINTS.JOB.GET_ONE(id), {
      params: { _t: Date.now() },
    });
    return response.data.data;
  },
  addPayment: async (id: number, data: CreateJobPaymentDto): Promise<JobPayment> => {
    const response = await apiClient.post(API_ENDPOINTS.JOB.ADD_PAYMENT(id), data);
    return response.data.data;
  },
};
