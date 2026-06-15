import request from 'supertest';
import app from '../../src/app';

const registerAndGetToken = async () => {
  const res = await request(app)
    .post('/api/v1/acrg/auth/register')
    .send({
      email: 'upload@test.com',
      password: 'Test1234',
      role: 'student',
    });

  return res.body.data.token;
};

describe('Upload Routes', () => {
  it('returns 400 INVALID_FILE_TYPE for txt files', async () => {
    const token = await registerAndGetToken();

    const res = await request(app)
      .post('/api/v1/acrg/upload/evidence')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('plain text'), {
        filename: 'notes.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
  });

  it('returns 400 FILE_TOO_LARGE for files over 10MB', async () => {
    const token = await registerAndGetToken();
    const oversizedPdf = Buffer.alloc(11 * 1024 * 1024, 1);

    const res = await request(app)
      .post('/api/v1/acrg/upload/evidence')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', oversizedPdf, {
        filename: 'large.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('FILE_TOO_LARGE');
  });

  it('returns 401 when auth token is missing', async () => {
    const res = await request(app)
      .post('/api/v1/acrg/upload/evidence')
      .attach('file', Buffer.from('%PDF-1.4'), {
        filename: 'certificate.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(401);
  });
});
