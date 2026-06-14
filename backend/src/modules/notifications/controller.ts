import { Request, Response } from 'express';
import crypto from 'crypto';
import { errorResponse } from '../../utils/errorResponse';
import { Notification } from '../../database/models/Notification';

const getMeta = (req: Request) => ({
  requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

// GET /notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      data: notifications,
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('getNotifications error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

// PATCH /notifications/:id/read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }

    return res.status(200).json({
      data: notification,
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('markAsRead error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};
