import { apiClient } from '../../../lib/http/apiClient';

export const roadmapApi = {
  getRoadmaps: async (params?: { page?: number; limit?: number; status?: string }) => {
    const res = await apiClient.get('/roadmap', { params });
    return res.data;
  },
  getRoadmapById: async (id: string) => {
    const res = await apiClient.get(`/roadmap/${id}`);
    return res.data;
  },
  createRoadmap: async (data: { gapAnalysisId: string }) => {
    const res = await apiClient.post('/roadmap', data);
    return res.data;
  },
  activateRoadmap: async (id: string) => {
    const res = await apiClient.patch(`/roadmap/${id}/activate`, {});
    return res.data;
  }
};
