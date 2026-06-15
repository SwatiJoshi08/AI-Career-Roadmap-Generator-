import { apiClient } from '../../../lib/http/apiClient';

export const notificationsApi = {
  getNotifications: async (params?: { cursor?: string; limit?: number; isRead?: boolean }) => {
    const res = await apiClient.get('/notifications', { params });
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await apiClient.patch(`/notifications/${id}/read`, {});
    return res.data;
  }
};
