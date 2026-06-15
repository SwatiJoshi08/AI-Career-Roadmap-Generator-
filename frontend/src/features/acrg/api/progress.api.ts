import { apiClient } from '../../../lib/http/apiClient';

export const progressApi = {
  createProgress: async (data: {
    roadmapId: string;
    milestoneId: string;
    note?: string;
    evidenceUrl?: string;
    fileName?: string;
    publicId?: string;
    resourceType?: string;
    fileSize?: number;
    flaggedForReview?: boolean;
  }) => {
    const res = await apiClient.post('/progress', data);
    return res.data;
  }
};
