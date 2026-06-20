import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import dns from 'dns';
import { importOnetData } from '../integrations/onet/onetImporter';

// Load .env using dotenv before connecting
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function run() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    // Force Node's DNS resolver to Google DNS to fix SRV lookup failures
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for O*NET import.');

    await importOnetData();

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error: any) {
    console.error('O*NET Import script failed:', error.message);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

run();
