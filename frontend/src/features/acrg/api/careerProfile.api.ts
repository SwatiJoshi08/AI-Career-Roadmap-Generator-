import { apiClient } from '../../../lib/http/apiClient';

export const careerProfileApi = {
  getMyProfile: async () => {
    const res = await apiClient.get('/careerprofile/me');
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await apiClient.put('/careerprofile/me', data);
    return res.data;
  }
};
