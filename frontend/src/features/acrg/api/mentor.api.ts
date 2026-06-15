import { apiClient } from '../../../lib/http/apiClient';

export const mentorApi = {
  getMentorQueue: async (params?: { page?: number; limit?: number }) => {
    const res = await apiClient.get('/mentor/queue', { params });
    return res.data;
  },
  addComment: async (data: {
    targetId: string;
    targetModel: string;
    comment: string;
    actionRequired?: boolean;
  }) => {
    const res = await apiClient.post('/mentor/comment', data);
    return res.data;
  }
};
