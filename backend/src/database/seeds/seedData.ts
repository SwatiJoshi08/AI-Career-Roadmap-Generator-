import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../config/db';
import { User } from '../models/User';

const seed = async () => {
  await connectDB();
  console.log('Seeding database...');
  
  // Clear existing seed data
  await User.deleteMany({ email: { $in: [
    'seed.student@acrg.com',
    'seed.mentor@acrg.com', 
    'seed.admin@acrg.com'
  ]}});

  // Create users
  const passwordHash = await bcrypt.hash('SeedPass123', 10);
  
  await User.create([
    {
      email: 'seed.student@acrg.com',
      passwordHash,
      role: 'student' as any,
      isVerified: true
    },
    {
      email: 'seed.mentor@acrg.com',
      passwordHash,
      role: 'career_mentor' as any,
      isVerified: true
    },
    {
      email: 'seed.admin@acrg.com',
      passwordHash,
      role: 'career_content_admin' as any,
      isVerified: true
    }
  ]);

  console.log('Seed completed!');
  await mongoose.disconnect();
};

seed().catch(console.error);
