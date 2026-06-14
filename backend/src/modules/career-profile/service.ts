import { Types } from 'mongoose';
import { CareerProfileRepository } from './repository';
import { User, Role, ICareerProfile } from '../../database/models';
import { logAudit } from '../../utils/auditLogger';

export const CareerProfileService = {
  async getProfile(userId: string) {
    const profile = await CareerProfileRepository.findByUserId(userId);
    return profile;
  },

  async createProfile(userId: string, data: Partial<ICareerProfile>, meta: any) {
    // Validate if student
    const user = await User.findById(userId);
    if (!user) {
      return { error: 'User not found', code: 404 };
    }
    if (user.role !== Role.STUDENT) {
      return { error: 'Only students can create a career profile', code: 403 };
    }

    let profile = await CareerProfileRepository.findByUserId(userId);
    if (profile) {
      // Upsert: updating the base profile created during registration
      const updateData = {
        ...data,
        updatedBy: new Types.ObjectId(userId)
      };
      profile = (await CareerProfileRepository.updateProfile(userId, updateData))!;
      
      await logAudit({
        actor: userId,
        actorEmail: user.email,
        action: 'CREATE_CAREER_PROFILE_UPSERT',
        targetId: profile._id,
        targetModel: 'CareerProfile',
        requestId: meta.requestId,
      });

      return { profile, code: 200 };
    }

    const newProfileData = {
      ...data,
      userId: new Types.ObjectId(userId),
      createdBy: new Types.ObjectId(userId)
    };

    profile = await CareerProfileRepository.createProfile(newProfileData);

    await logAudit({
      actor: userId,
      actorEmail: user.email,
      action: 'CREATE_CAREER_PROFILE',
      targetId: profile._id,
      targetModel: 'CareerProfile',
      requestId: meta.requestId,
    });

    return { profile, code: 201 };
  },

  async updateProfile(userId: string, data: Partial<ICareerProfile>, meta: any) {
    const profile = await CareerProfileRepository.findByUserId(userId);
    if (!profile) {
      return { error: 'Career profile not found', code: 404 };
    }

    // Since users can only update their own profile, ownership is guaranteed by findByUserId
    const updateData = {
      ...data,
      updatedBy: new Types.ObjectId(userId)
    };

    const updatedProfile = await CareerProfileRepository.updateProfile(userId, updateData);

    await logAudit({
      actor: userId,
      action: 'UPDATE_CAREER_PROFILE',
      targetId: profile._id,
      targetModel: 'CareerProfile',
      requestId: meta.requestId,
    });

    return { profile: updatedProfile, code: 200 };
  }
};
