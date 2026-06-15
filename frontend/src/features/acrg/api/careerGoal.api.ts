import { apiClient } from '../../../lib/http/apiClient';

export const careerGoalApi = {
  getGoals: async (params?: { page?: number; limit?: number; status?: string }) => {
    const res = await apiClient.get('/careergoal', { params });
    return res.data;
  },
  getGoalById: async (id: string) => {
    const res = await apiClient.get(`/careergoal/${id}`);
    return res.data;
  },
  createGoal: async (data: any) => {
    const res = await apiClient.post('/careergoal', data);
    return res.data;
  },
  updateGoal: async (id: string, data: any) => {
    const res = await apiClient.put(`/careergoal/${id}`, data);
    return res.data;
  }
};
