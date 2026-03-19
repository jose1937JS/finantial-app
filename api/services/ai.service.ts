import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { AnalyzeResponse } from '../../types/api';

export const AiService = {
  analyzeText: async (text: string): Promise<AnalyzeResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.ANALYZE_TEXT, { text });
    return response.data;
  },
  analyzeAudio: async (audioData: any): Promise<AnalyzeResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.ANALYZE_AUDIO, audioData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  analyzeImage: async (imageData: any): Promise<AnalyzeResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AI.ANALYZE_IMAGE, imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
