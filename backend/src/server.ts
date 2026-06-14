import app from './app';
import { config } from './config/env';
import { connectDB } from './config/db';
import { redis } from './config/redis';
import mongoose from 'mongoose';
import './jobs/gapAnalysisWorker';
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    const server = app.listen(config.PORT, () => {
      console.log(`Server is running in ${config.NODE_ENV} mode on port ${config.PORT}`);
    });

    // Graceful Shutdown
    const shutdown = async () => {
      console.log('Received shutdown signal, closing server gracefully...');
      server.close(async () => {
        console.log('HTTP server closed.');
        try {
          await redis.quit();
          console.log('Redis connection closed.');
          await mongoose.connection.close();
          console.log('MongoDB connection closed.');
          process.exit(0);
        } catch (err) {
          console.error('Error during graceful shutdown:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Fatal server startup error:', error);
    process.exit(1);
  }
};

startServer();
