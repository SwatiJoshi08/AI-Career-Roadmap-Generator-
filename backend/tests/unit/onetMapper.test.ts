import { mapOccupation } from '../../src/integrations/onet/onetMapper';

describe('OnetMapper', () => {
  it('Valid occupation data -> maps all fields correctly', () => {
    const rawOccupation = {
      occupationCode: '15-1252.00',
      title: 'Software Developers',
      description: 'Research, design, and develop computer software systems',
      sampleJobTitles: ['Software Engineer', 'Backend Developer'],
      alternateTitles: ['Full Stack Developer', 'Application Engineer'],
      education: "Bachelor's degree",
      experience: 'None to some',
      training: 'None required',
      jobZone: 4,
      salaryInfo: {
        medianAnnual: 120730,
        currency: 'USD',
      },
    };

    const rawSkills = [
      { name: 'Programming', description: 'Writing code', importance: 95 },
    ];

    const rawKnowledge = [
      { name: 'Computer Science', description: 'CS fundamentals', importance: 95 },
    ];

    const rawAbilities = [
      { name: 'Mathematical Reasoning', description: 'Apply math', importance: 90 },
    ];

    const rawActivities = [
      { name: 'Coding', description: 'Write programs', importance: 88 },
    ];

    const rawTechSkills = ['Python', 'Java', 'Git'];
    const rawTools = ['Laptop', 'Server'];

    const mapped = mapOccupation(
      rawOccupation,
      rawSkills,
      rawKnowledge,
      rawAbilities,
      rawActivities,
      rawTechSkills,
      rawTools
    );

    expect(mapped.occupationCode).toBe('15-1252.00');
    expect(mapped.title).toBe('Software Developers');
    expect(mapped.description).toBe('Research, design, and develop computer software systems');
    expect(mapped.sampleJobTitles).toEqual(['Software Engineer', 'Backend Developer']);
    expect(mapped.education).toBe("Bachelor's degree");
    expect(mapped.experience).toBe('None to some');
    expect(mapped.training).toBe('None required');
    expect(mapped.jobZone).toBe(4);
    expect(mapped.salaryInfo?.medianAnnual).toBe(120730);
    expect(mapped.salaryInfo?.currency).toBe('USD');
    expect(mapped.skills).toEqual([
      { name: 'Programming', description: 'Writing code', importance: 95, level: 0 },
    ]);
    expect(mapped.knowledge).toEqual([
      { name: 'Computer Science', description: 'CS fundamentals', importance: 95, level: 0 },
    ]);
    expect(mapped.abilities).toEqual([
      { name: 'Mathematical Reasoning', description: 'Apply math', importance: 90, level: 0 },
    ]);
    expect(mapped.workActivities).toEqual([
      { name: 'Coding', description: 'Write programs', importance: 88, level: 0 },
    ]);
    expect(mapped.technologySkills).toEqual(['Python', 'Java', 'Git']);
    expect(mapped.toolsUsed).toEqual(['Laptop', 'Server']);
  });

  it('Missing skills -> defaults to empty array', () => {
    const rawOccupation = {
      occupationCode: '15-1252.00',
      title: 'Software Developers',
      jobZone: 4,
    };
    const mapped = mapOccupation(rawOccupation, undefined, []);
    expect(mapped.skills).toEqual([]);
  });

  it('Missing knowledge -> defaults to empty array', () => {
    const rawOccupation = {
      occupationCode: '15-1252.00',
      title: 'Software Developers',
      jobZone: 4,
    };
    const mapped = mapOccupation(rawOccupation, [], undefined);
    expect(mapped.knowledge).toEqual([]);
  });

  it('Trims whitespace from title and description', () => {
    const rawOccupation = {
      occupationCode: '15-1252.00',
      title: '   Software Developers   ',
      description: '   Research, design, and develop computer software systems   ',
      jobZone: 4,
    };
    const mapped = mapOccupation(rawOccupation, [], []);
    expect(mapped.title).toBe('Software Developers');
    expect(mapped.description).toBe('Research, design, and develop computer software systems');
  });
});
