import { getOccupationByCode } from '../onetService';

export async function retrieveOccupationContext(occupationCode: string): Promise<any> {
  const occ = await getOccupationByCode(occupationCode);
  if (!occ) {
    return null;
  }

  return {
    occupation: {
      occupationCode: occ.occupationCode,
      title: occ.title,
      description: occ.description || '',
      sampleJobTitles: occ.sampleJobTitles || [],
      alternateTitles: occ.alternateTitles || [],
      education: occ.education || '',
      experience: occ.experience || '',
      training: occ.training || '',
      jobZone: occ.jobZone,
      salaryInfo: occ.salaryInfo || { medianAnnual: 0, currency: 'USD' },
    },
    skills: occ.skills || [],
    knowledge: occ.knowledge || [],
    abilities: occ.abilities || [],
    workActivities: occ.workActivities || [],
    education: occ.education || '',
    jobZone: occ.jobZone,
  };
}
