import request from 'supertest';
import app from '../../src/app';
import { OnetOccupation } from '../../src/database/models/OnetOccupation';
import { bulkUpsertOccupations } from '../../src/integrations/onet/onetRepository';
import { importOnetData } from '../../src/integrations/onet/onetImporter';
import { retrieveOccupationContext } from '../../src/integrations/onet/retrieval/context';

jest.setTimeout(30000);

describe('O*NET Expanded Integration Tests', () => {
  let token: string;

  beforeAll(async () => {
    // Register a user to get an auth token
    const registerRes = await request(app)
      .post('/api/v1/acrg/auth/register')
      .send({ email: 'onet-tester-expanded@test.com', password: 'TestPassword123', role: 'student' });
    token = registerRes.body.data.token;
  });

  beforeEach(async () => {
    await OnetOccupation.deleteMany({});
  });

  const sampleOccupations = [
    {
      occupationCode: '15-1252.00',
      title: 'Software Developers',
      description: 'Research, design, and develop computer software systems',
      sampleJobTitles: ['Software Engineer'],
      alternateTitles: ['Full Stack Developer'],
      education: "Bachelor's degree",
      experience: 'None',
      training: 'None',
      jobZone: 4,
      salaryInfo: { medianAnnual: 120000, currency: 'USD', period: 'yearly' },
      skills: [{ name: 'Programming', description: 'Write code', importance: 95, level: 5 }],
      knowledge: [{ name: 'Computer Science', description: 'CS foundations', importance: 90, level: 5 }],
      abilities: [{ name: 'Deductive Reasoning', description: 'Reasoning logic', importance: 85, level: 5 }],
      workActivities: [{ name: 'Analyzing Data', description: 'Data analysis', importance: 80, level: 5 }],
      technologySkills: ['Python', 'Docker'],
      toolsUsed: ['Computer'],
    },
    {
      occupationCode: '15-2051.00',
      title: 'Data Scientists',
      description: 'Analyze data',
      sampleJobTitles: ['Data Scientist'],
      alternateTitles: ['ML Engineer'],
      education: "Master's degree",
      experience: 'Some',
      training: 'None',
      jobZone: 5,
      salaryInfo: { medianAnnual: 110000, currency: 'USD', period: 'yearly' },
      skills: [{ name: 'Mathematics', description: 'Do math', importance: 90, level: 5 }],
      knowledge: [{ name: 'Statistics', description: 'Stats foundations', importance: 95, level: 5 }],
      abilities: [],
      workActivities: [],
      technologySkills: ['Python', 'SQL'],
      toolsUsed: ['GPU Server'],
    },
  ];

  it('bulkUpsertOccupations -> imports sample occupations correctly', async () => {
    const res = await bulkUpsertOccupations(sampleOccupations);
    expect(res.inserted).toBe(2);

    const count = await OnetOccupation.countDocuments();
    expect(count).toBe(2);
  });

  it('bulkUpsertOccupations same data -> prevents duplicates', async () => {
    await bulkUpsertOccupations(sampleOccupations);
    const res = await bulkUpsertOccupations(sampleOccupations);
    expect(res.inserted).toBe(0);

    const count = await OnetOccupation.countDocuments();
    expect(count).toBe(2);
  });

  it('importOnetData -> runs pipeline successfully', async () => {
    // Assumes test data files exist in data/onet (we created them in Step 2 of previous request)
    await importOnetData();
    const count = await OnetOccupation.countDocuments();
    expect(count).toBeGreaterThan(0);
  });

  it('GET /api/v1/acrg/onet/search -> supports text query', async () => {
    await OnetOccupation.create(sampleOccupations);

    const res = await request(app)
      .get('/api/v1/acrg/onet/search')
      .set('Authorization', `Bearer ${token}`)
      .query({ q: 'Software' });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].title).toBe('Software Developers');
  });

  it('GET /api/v1/acrg/onet/search -> supports skill search', async () => {
    await OnetOccupation.create(sampleOccupations);

    const res = await request(app)
      .get('/api/v1/acrg/onet/search')
      .set('Authorization', `Bearer ${token}`)
      .query({ skill: 'Programming' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Software Developers');
  });

  it('GET /api/v1/acrg/onet/:occupationCode -> looks up occupation by code', async () => {
    await OnetOccupation.create(sampleOccupations);

    const res = await request(app)
      .get('/api/v1/acrg/onet/15-1252.00')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.occupationCode).toBe('15-1252.00');
    expect(res.body.data.title).toBe('Software Developers');
  });

  it('GET /api/v1/acrg/onet/:occupationCode/skills -> gets sorted required skills', async () => {
    await OnetOccupation.create(sampleOccupations);

    const res = await request(app)
      .get('/api/v1/acrg/onet/15-1252.00/skills')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.criticalSkills).toBeDefined();
    expect(res.body.data.importantSkills).toBeDefined();
  });

  it('retrieveOccupationContext & GET /api/v1/acrg/onet/:occupationCode/context -> retrieves RAG context structure', async () => {
    await OnetOccupation.create(sampleOccupations);

    const context = await retrieveOccupationContext('15-1252.00');
    expect(context).toBeDefined();
    expect(context.occupation.title).toBe('Software Developers');
    expect(context.skills).toHaveLength(1);

    const res = await request(app)
      .get('/api/v1/acrg/onet/15-1252.00/context')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.occupation.title).toBe('Software Developers');
  });
});
