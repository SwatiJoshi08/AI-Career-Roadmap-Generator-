import { apiClient } from '../../../lib/http/apiClient';

export const adminApi = {
  getAuditEvents: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/audit-events', { params });
    return res.data;
  },
  getAnalyticsSummary: async () => {
    const res = await apiClient.get('/admin/analytics/summary');
    return res.data;
  }
};
