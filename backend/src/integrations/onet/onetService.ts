import { OnetOccupation } from '../../database/models/OnetOccupation';

export async function searchOccupations(
  query: string
): Promise<Array<{ occupationCode: string; title: string; description: string; jobZone?: number; education: string }>> {
  const filter: any = { deletedAt: null };
  const trimmed = query ? query.trim() : '';

  if (trimmed !== '') {
    // Hybrid search: full-text $text for relevance + regex for partial matches on title and sampleJobTitles
    filter.$or = [
      { $text: { $search: trimmed } },
      { title: { $regex: trimmed, $options: 'i' } },
      { sampleJobTitles: { $elemMatch: { $regex: trimmed, $options: 'i' } } },
    ];
  }

  const q = OnetOccupation.find(filter)
    .select('occupationCode title description jobZone education -_id')
    // Apply a limit only when a search query is provided to avoid truncating the full list view
    .limit(trimmed !== '' ? 100 : 0);

  if (trimmed === '') {
    q.sort({ jobZone: -1 });
  }

  const results = await q.exec();
  return results.map((doc) => ({
    occupationCode: doc.occupationCode,
    title: doc.title,
    description: doc.description || '',
    jobZone: doc.jobZone ?? undefined,
    education: doc.education || '',
  }));
}

export async function searchBySkill(
  skillName: string
): Promise<Array<{ occupationCode: string; title: string; description: string; jobZone?: number; education: string }>> {
  if (!skillName) return [];
  const results = await OnetOccupation.find({
    deletedAt: null,
    'skills.name': { $regex: new RegExp(`^${skillName.trim()}$`, 'i') },
  })
    .select('occupationCode title description jobZone education -_id')
    .sort({ jobZone: -1 })
    .limit(20)
    .exec();

  return results.map((doc) => ({
    occupationCode: doc.occupationCode,
    title: doc.title,
    description: doc.description || '',
    jobZone: doc.jobZone ?? undefined,
    education: doc.education || '',
  }));
}

export async function searchByKnowledge(
  knowledgeName: string
): Promise<Array<{ occupationCode: string; title: string; description: string; jobZone?: number; education: string }>> {
  if (!knowledgeName) return [];
  const results = await OnetOccupation.find({
    deletedAt: null,
    'knowledge.name': { $regex: new RegExp(`^${knowledgeName.trim()}$`, 'i') },
  })
    .select('occupationCode title description jobZone education -_id')
    .sort({ jobZone: -1 })
    .limit(20)
    .exec();

  return results.map((doc) => ({
    occupationCode: doc.occupationCode,
    title: doc.title,
    description: doc.description || '',
    jobZone: doc.jobZone ?? undefined,
    education: doc.education || '',
  }));
}

export async function searchByJobZone(
  jobZone: number
): Promise<Array<{ occupationCode: string; title: string; description: string; jobZone?: number; education: string }>> {
  const results = await OnetOccupation.find({
    deletedAt: null,
    jobZone: jobZone,
  })
    .select('occupationCode title description jobZone education -_id')
    .sort({ title: 1 })
    .limit(20)
    .exec();

  return results.map((doc) => ({
    occupationCode: doc.occupationCode,
    title: doc.title,
    description: doc.description || '',
    jobZone: doc.jobZone ?? undefined,
    education: doc.education || '',
  }));
}

export async function getOccupationByCode(
  occupationCode: string
): Promise<any | null> {
  if (!occupationCode) return null;
  return OnetOccupation.findOne({
    deletedAt: null,
    occupationCode: occupationCode.trim(),
  }).exec();
}

export async function relatedOccupations(
  occupationCode: string
): Promise<Array<{ occupationCode: string; title: string; description: string; jobZone?: number; education: string }>> {
  const target = await getOccupationByCode(occupationCode);
  if (!target) return [];

  // Find other occupations in the same job zone
  const results = await OnetOccupation.find({
    deletedAt: null,
    occupationCode: { $ne: target.occupationCode },
    jobZone: target.jobZone,
  })
    .select('occupationCode title description jobZone education -_id')
    .sort({ title: 1 })
    .limit(20)
    .exec();

  return results.map((doc) => ({
    occupationCode: doc.occupationCode,
    title: doc.title,
    description: doc.description || '',
    jobZone: doc.jobZone ?? undefined,
    education: doc.education || '',
  }));
}

export async function getRequiredSkillsForOccupation(occupationCode: string) {
  const occupation = await getOccupationByCode(occupationCode);
  if (!occupation) {
    return {
      criticalSkills: [],
      importantSkills: [],
      knowledge: [],
      abilities: [],
    };
  }

  const sortedSkills = [...(occupation.skills || [])].sort((a, b) => b.importance - a.importance);
  const sortedKnowledge = [...(occupation.knowledge || [])].sort((a, b) => b.importance - a.importance);
  const sortedAbilities = [...(occupation.abilities || [])].sort((a, b) => b.importance - a.importance);

  const criticalSkills = sortedSkills.filter((s) => s.importance >= 80);
  const importantSkills = sortedSkills.filter((s) => s.importance < 80);

  return {
    criticalSkills,
    importantSkills,
    knowledge: sortedKnowledge,
    abilities: sortedAbilities,
  };
}
