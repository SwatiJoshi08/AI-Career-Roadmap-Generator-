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
    // using findOne + save to trigger mongoose hooks/version bumps
    const profile = await CareerProfile.findOne({ userId });
    if (!profile) return null;

    profile.set(data);
    
    // Explicitly handle version bump
    profile.version = (profile.version || 0) + 1;

    return profile.save();
  }
};
