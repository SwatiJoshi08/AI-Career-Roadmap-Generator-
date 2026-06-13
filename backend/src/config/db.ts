import dns from 'dns';
import mongoose from 'mongoose';
import { config } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    // Force Node's DNS resolver to Google DNS to fix SRV lookup failures
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};
