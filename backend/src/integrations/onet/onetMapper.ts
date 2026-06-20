import { IOnetOccupation } from '../../database/models/OnetOccupation';

export interface RawOccupation {
  occupationCode: string;
  title: string;
  description?: string | null;
  sampleJobTitles?: string[] | null;
  alternateTitles?: string[] | null;
  education?: string | null;
  experience?: string | null;
  training?: string | null;
  jobZone: number;
  salaryInfo?: {
    medianAnnual?: number | null;
    currency?: string | null;
  } | null;
}

export interface RawSubItem {
  name: string;
  description?: string | null;
  importance: number;
}

export function mapOccupation(
  raw: RawOccupation,
  skills: RawSubItem[] = [],
  knowledge: RawSubItem[] = [],
  abilities: RawSubItem[] = [],
  workActivities: RawSubItem[] = [],
  technologySkills: string[] = [],
  toolsUsed: string[] = []
): Partial<IOnetOccupation> {
  const trimOrEmpty = (str: string | null | undefined): string => {
    return str ? str.trim() : '';
  };

  const mapSubItems = (items: RawSubItem[] = []) => {
    return (items || []).map((item) => ({
      name: trimOrEmpty(item.name),
      description: trimOrEmpty(item.description),
      importance: typeof item.importance === 'number' ? item.importance : 0,
      level: 0, // Default since it's not provided by RawSubItem
    }));
  };

  const cleanStringArray = (arr: any): string[] => {
    return Array.isArray(arr)
      ? arr.map((t) => (typeof t === 'string' ? t.trim() : '')).filter((t) => t.length > 0)
      : [];
  };

  const normalizedTitle = trimOrEmpty(raw.title);
  const normalizedDescription = trimOrEmpty(raw.description);
  
  // Transform education/experience to arrays or omit
  const education = raw.education ? raw.education : '';
  const experience = raw.experience ? raw.experience : '';

  const sampleJobTitles = cleanStringArray(raw.sampleJobTitles);

  const medianWage = raw.salaryInfo && typeof raw.salaryInfo.medianAnnual === 'number'
    ? raw.salaryInfo.medianAnnual
    : 0;

  const currency = raw.salaryInfo && raw.salaryInfo.currency
    ? trimOrEmpty(raw.salaryInfo.currency)
    : 'USD';

  return {
    occupationCode: trimOrEmpty(raw.occupationCode),
    title: normalizedTitle,
    description: normalizedDescription,
    sampleJobTitles,
    skills: mapSubItems(skills),
    knowledge: mapSubItems(knowledge),
    abilities: mapSubItems(abilities),
    workActivities: mapSubItems(workActivities),
    education,
    experience,
    training: trimOrEmpty(raw.training),
    technologySkills: cleanStringArray(technologySkills),
    toolsUsed: cleanStringArray(toolsUsed),
    jobZone: typeof raw.jobZone === 'number' ? raw.jobZone : 1,
    salaryInfo: {
      medianAnnual: medianWage,
      medianWage,
      currency,
      period: 'yearly',
    },
  };
}
