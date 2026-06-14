import { CareerGoal, ICareerGoal } from '../../database/models';

export const CareerGoalRepository = {
  async findGoals(userId: string, filters: any, sort: any, skip: number, limit: number): Promise<{ data: ICareerGoal[], total: number }> {
    const query = { userId, ...filters };
    
    const [data, total] = await Promise.all([
      CareerGoal.find(query).sort(sort).skip(skip).limit(limit),
      CareerGoal.countDocuments(query)
    ]);
    
    return { data, total };
  },

  async findGoalByIdAndUserId(id: string, userId: string): Promise<ICareerGoal | null> {
    return CareerGoal.findOne({ _id: id, userId });
  },

  async findGoalByTitleAndUserId(title: string, userId: string): Promise<ICareerGoal | null> {
    // case-insensitive exact match
    return CareerGoal.findOne({ 
      title: { $regex: `^${title}$`, $options: 'i' }, 
      userId 
    });
  },

  async createGoal(data: Partial<ICareerGoal>): Promise<ICareerGoal> {
    const goal = new CareerGoal(data);
    return goal.save();
  },

  async updateGoal(goal: ICareerGoal, updateData: Partial<ICareerGoal>): Promise<ICareerGoal> {
    goal.set(updateData);
    goal.version = (goal.version || 0) + 1;
    return goal.save();
  }
};
