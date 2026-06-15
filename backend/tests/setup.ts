import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue('OK'),
    disconnect: jest.fn(),
  }));
});

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
    close: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  })),
  Worker: jest.fn().mockImplementation(() => ({
    close: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  })),
}));

let mongod: MongoMemoryServer;

process.env.JWT_SECRET = 'testsecret';

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}, 60000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}, 60000);
