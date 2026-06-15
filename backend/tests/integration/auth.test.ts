import request from 'supertest';
import app from '../../src/app';

describe('Auth Routes', () => {
  it('TC-01: POST /auth/register returns 201 with token', async () => {
    const res = await request(app)
      .post('/api/v1/acrg/auth/register')
      .send({ 
        email: 'student@test.com', 
        password: 'Test1234', 
        role: 'student' 
      });
    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
  });

  it('TC-01: POST /auth/login returns 200 with token', async () => {
    await request(app)
      .post('/api/v1/acrg/auth/register')
      .send({ email: 'student@test.com', password: 'Test1234', role: 'student' });
    const res = await request(app)
      .post('/api/v1/acrg/auth/login')
      .send({ email: 'student@test.com', password: 'Test1234' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('TC-03: POST /careergoal with missing title returns 400', async () => {
    const registerRes = await request(app)
      .post('/api/v1/acrg/auth/register')
      .send({ email: 'student2@test.com', password: 'Test1234', role: 'student' });
    const token = registerRes.body.data.token;

    const res = await request(app)
      .post('/api/v1/acrg/careergoal')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'No title here' });
    expect(res.status).toBe(400);
  });
});
