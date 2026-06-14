import { Skill } from '../../database/models/Skill';
import { SkillEvidence } from '../../database/models/SkillEvidence';

export class SkillRepository {
    async findByUserId(userId: string, filters: { category?: string; proficiencyLevel?: string }) {
        const query: any = { userId, deletedAt: null };
        if (filters.category) query.category = filters.category;
        if (filters.proficiencyLevel) query.proficiencyLevel = filters.proficiencyLevel;
        return Skill.find(query).sort({ createdAt: -1 }).lean();
    }

    async findByUserIdAndName(userId: string, name: string) {
        return Skill.findOne({
            userId,
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            deletedAt: null
        }).lean();
    }

    async findById(id: string) {
        return Skill.findById(id).lean();
    }

    async create(data: any) {
        const skill = new Skill(data);
        return skill.save();
    }

    async update(id: string, data: any) {
        return Skill.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    }

    async addEvidence(data: any) {
        const evidence = new SkillEvidence(data);
        return evidence.save();
    }
}