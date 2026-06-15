import { apiClient } from '../../../lib/http/apiClient';

export const gapAnalysisApi = {
  getGapAnalyses: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get('/gapanalysis', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/gapanalysis/${id}`);
    return res.data;
  },
  createGapAnalysis: async (data: { careerGoalId: string }) => {
    const res = await apiClient.post('/gapanalysis', data);
    return res.data;
  },
  getStatus: async (id: string) => {
    const res = await apiClient.get(`/gapanalysis/${id}/status`);
    return res.data;
  }
};
