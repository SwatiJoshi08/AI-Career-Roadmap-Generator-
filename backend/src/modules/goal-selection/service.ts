import { Types } from 'mongoose';
import { CareerGoalRepository } from './repository';
import { ICareerGoal, User } from '../../database/models';
import { logAudit } from '../../utils/auditLogger';

export const CareerGoalService = {
  async getGoals(userId: string, query: { page?: number, limit?: number, status?: string }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filters: any = {};
    if (query.status) {
      filters.status = query.status;
    }

    const sort = { createdAt: -1 };

    const { data, total } = await CareerGoalRepository.findGoals(userId, filters, sort, skip, limit);

    return {
      goals: data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  async getGoalById(userId: string, goalId: string) {
    const goal = await CareerGoalRepository.findGoalByIdAndUserId(goalId, userId);
    if (!goal) {
      return { error: 'Goal not found', code: 404 };
    }
    return { goal, code: 200 };
  },

  async createGoal(userId: string, data: Partial<ICareerGoal>, meta: any) {
    // Check for duplicates
    if (data.title) {
      const existing = await CareerGoalRepository.findGoalByTitleAndUserId(data.title, userId);
      if (existing) {
        return { error: 'A goal with this title already exists', code: 400 };
      }
    }

    const user = await User.findById(userId);

    const goalData = {
      ...data,
      userId: new Types.ObjectId(userId),
      createdBy: new Types.ObjectId(userId)
    };

    const goal = await CareerGoalRepository.createGoal(goalData);

    await logAudit({
      actor: userId,
      actorEmail: user?.email,
      action: 'CREATE_CAREER_GOAL',
      targetId: goal._id,
      targetModel: 'CareerGoal',
      requestId: meta.requestId,
    });

    return { goal, code: 201 };
  },

  async updateGoal(userId: string, goalId: string, updateData: Partial<ICareerGoal>, meta: any) {
    const goal = await CareerGoalRepository.findGoalByIdAndUserId(goalId, userId);
    if (!goal) {
      return { error: 'Goal not found', code: 404 };
    }

    // Optional: check for duplicate title on update if title is changing
    if (updateData.title && updateData.title.toLowerCase() !== goal.title.toLowerCase()) {
      const existing = await CareerGoalRepository.findGoalByTitleAndUserId(updateData.title, userId);
      if (existing) {
        return { error: 'A goal with this title already exists', code: 400 };
      }
    }

    const dataToUpdate = {
      ...updateData,
      updatedBy: new Types.ObjectId(userId)
    };

    const updatedGoal = await CareerGoalRepository.updateGoal(goal, dataToUpdate);

    await logAudit({
      actor: userId,
      action: 'UPDATE_CAREER_GOAL',
      targetId: goal._id,
      targetModel: 'CareerGoal',
      requestId: meta.requestId,
    });

    return { goal: updatedGoal, code: 200 };
  }
};
