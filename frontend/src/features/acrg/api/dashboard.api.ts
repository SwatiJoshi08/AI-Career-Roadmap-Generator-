import { apiClient } from '../../../lib/http/apiClient';

export const dashboardApi = {
  getDashboard: async () => {
    const res = await apiClient.get('/dashboard');
    return res.data;
  }
};
