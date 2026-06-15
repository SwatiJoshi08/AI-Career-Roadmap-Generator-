import { apiClient } from '../../../lib/http/apiClient';

export const skillsApi = {
  getSkills: async (params?: { category?: string; proficiencyLevel?: string }) => {
    const res = await apiClient.get('/skills', { params });
    return res.data;
  },
  createSkill: async (data: any) => {
    const res = await apiClient.post('/skills', data);
    return res.data;
  },
  addEvidence: async (skillId: string, data: any) => {
    const res = await apiClient.post(`/skills/${skillId}/evidence`, data);
    return res.data;
  }
};
