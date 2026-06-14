import { CareerProfile, ICareerProfile } from '../../database/models';

export const CareerProfileRepository = {
  async findByUserId(userId: string): Promise<ICareerProfile | null> {
    return CareerProfile.findOne({ userId });
  },

  async createProfile(data: Partial<ICareerProfile>): Promise<ICareerProfile> {
    const profile = new CareerProfile(data);
    return profile.save();
  },

  async updateProfile(userId: string, data: Partial<ICareerProfile>): Promise<ICareerProfile | null> {
    return CareerProfile.findOneAndUpdate(
      { userId },
      { 
        $set: data,
        $inc: { version: 1 }
      },
      { new: true, runValidators: true }
    );
  }
};
