import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/database/models/User';
import { AuthService } from '../../src/modules/auth/auth.service';
import mongoose from 'mongoose';
import { uploadFile } from '../../src/integrations/cloudinary/cloudinaryService';

jest.mock('../../src/integrations/cloudinary/cloudinaryService');

describe('Upload API', () => {
  let authToken: string;
  let userId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    userId = new mongoose.Types.ObjectId();
    const user = new User({
      _id: userId,
      email: 'uploadtest@example.com',
      passwordHash: 'hashed_password',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
    });
    await user.save();
    authToken = AuthService.generateToken(user._id.toString(), user.email, user.role);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app)
      .post('/api/v1/acrg/upload/evidence')
      .attach('file', Buffer.from('test content'), 'test.pdf');
    expect(res.status).toBe(401);
  });

  it('should return 400 if no file is provided', async () => {
    const res = await request(app)
      .post('/api/v1/acrg/upload/evidence')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid file type', async () => {
    const res = await request(app)
      .post('/api/v1/acrg/upload/evidence')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', Buffer.from('test text'), 'test.txt'); // txt is not allowed
    
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
  });

  it('should return 400 for oversized file', async () => {
    // Generate an 11MB file buffer
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 'a');
    
    const res = await request(app)
      .post('/api/v1/acrg/upload/evidence')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', largeBuffer, 'large.pdf');
    
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('FILE_TOO_LARGE');
  });

  it('should successfully upload a valid pdf file', async () => {
    const mockCloudinaryResponse = {
      url: 'https://www.google.com/search?q=test.pdf+res.cloudinary.com',
      publicId: 'acrg/evidence/test',
      resourceType: 'image',
      fileName: 'test.pdf',
      fileSize: 1024,
    };

    (uploadFile as jest.Mock).mockResolvedValueOnce(mockCloudinaryResponse);

    const res = await request(app)
      .post('/api/v1/acrg/upload/evidence')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', Buffer.from('dummy pdf content'), 'test.pdf');
    
    expect(res.status).toBe(201);
    expect(res.body.data).toEqual(mockCloudinaryResponse);
    expect(uploadFile).toHaveBeenCalled();
  });
});
