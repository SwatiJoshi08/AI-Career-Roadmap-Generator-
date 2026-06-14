import { SkillRepository } from './repository';
import { AppError } from '../../common/errors';

const skillRepository = new SkillRepository();

export class SkillService {
    // ---------- List ----------
    async listSkills(
        userId: string,
        filters: { category?: string; proficiencyLevel?: string }
    ) {
        return skillRepository.findByUserId(userId, filters);
    }

    // ---------- Create ----------
    async createSkill(userId: string, data: any, meta?: any) {
        void meta;                                 // <‑‑ silence unused‑param warning
        const existing = await skillRepository.findByUserIdAndName(
            userId,
            data.name
        );
        if (existing) {
            throw new AppError('Skill already exists', 409, 'CONFLICT');
        }
        return skillRepository.create({
            ...data,
            userId,
            createdBy: userId,
            updatedBy: userId,
        });
    }

    // ---------- Update ----------
    async updateSkill(userId: string, skillId: string, data: any, meta?: any) {
        void meta;                                 // <‑‑ silence unused‑param warning
        const skill = await skillRepository.findById(skillId);
        if (!skill) throw new AppError('Skill not found', 404, 'NOT_FOUND');
        if (skill.userId.toString() !== userId)
            throw new AppError('Forbidden', 403, 'FORBIDDEN');

        return skillRepository.update(skillId, { ...data, updatedBy: userId });
    }

    // ---------- Add evidence ----------
    async addEvidence(userId: string, skillId: string, data: any, meta?: any) {
        void meta;                                 // <‑‑ silence unused‑param warning
        const skill = await skillRepository.findById(skillId);
        if (!skill) throw new AppError('Skill not found', 404, 'NOT_FOUND');
        if (skill.userId.toString() !== userId)
            throw new AppError('Forbidden', 403, 'FORBIDDEN');

        return skillRepository.addEvidence({ ...data, skillId, userId });
    }
}

/* Export a singleton used by the controller */
export const skillService = new SkillService();
