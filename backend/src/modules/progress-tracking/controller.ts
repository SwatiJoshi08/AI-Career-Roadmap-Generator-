import { Request, Response } from 'express';
import crypto from 'crypto';
import { errorResponse } from '../../utils/errorResponse';
import { ProgressUpdate } from '../../database/models/ProgressUpdate';
import { Notification } from '../../database/models/Notification';
import { User } from '../../database/models/User';
import { Role } from '../../database/models/enums';
import { stripHtml } from '../../common/sanitize';

const getMeta = (req: Request) => ({
  requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
  timestamp: new Date().toISOString(),
});

// POST /progress
export const createProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const progressData = { 
      ...req.body, 
      note: req.body.note ? stripHtml(req.body.note) : undefined,
      evidenceUrl: req.body.evidenceUrl ? stripHtml(req.body.evidenceUrl) : undefined,
      fileName: req.body.fileName ? stripHtml(req.body.fileName) : undefined,
      publicId: req.body.publicId ? stripHtml(req.body.publicId) : undefined,
      resourceType: req.body.resourceType ? stripHtml(req.body.resourceType) : undefined,
      fileSize: req.body.fileSize,
      userId, 
      createdBy: userId 
    };
    const progress = await ProgressUpdate.create(progressData);

    if (progress.flaggedForReview) {
      const mentors = await User.find({ role: Role.CAREER_MENTOR }).select('_id');
      const mentorNotifications = mentors.map((mentor) => ({
        userId: mentor._id,
        title: 'New Progress Update for Review',
        body: 'A student has submitted progress and requested your review.',
        type: 'mentor_review',
        relatedId: progress._id,
        relatedModel: 'ProgressUpdate',
        isRead: false,
        createdBy: userId,
        updatedBy: userId,
      }));

      await Notification.create([
        ...mentorNotifications,
        {
          userId,
          title: 'Progress Submitted',
          body: 'Your progress update has been submitted for mentor review.',
          type: 'progress_submitted',
          relatedId: progress._id,
          relatedModel: 'ProgressUpdate',
          isRead: false,
          createdBy: userId,
          updatedBy: userId,
        },
      ]);
    }

    return res.status(201).json({
      data: progress,
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('createProgress error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};

// GET /progress
export const getProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return errorResponse(res, 401, 'Unauthorized');

    const progress = await ProgressUpdate.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      data: progress,
      meta: getMeta(req),
      error: null,
    });
  } catch (e) {
    console.error('getProgress error:', e);
    return errorResponse(res, 500, 'Internal server error');
  }
};
