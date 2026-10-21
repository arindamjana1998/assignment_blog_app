import mongoose from 'mongoose';
import env from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: env.isDevelopment, // Build indexes in development; in production prefer manual or managed index builds
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Runtime connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[MongoDB] Disconnected from database');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('[MongoDB] Reconnected to database');
    });

  } catch (error) {
    console.error(`[MongoDB] Initial connection error: ${error.message}`);
    // Allow caller / server bootstrap to handle error
    throw error;
  }
};

export const disconnectDB = async () => {
  if (!isConnected) {
    return;
  }
  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log('[MongoDB] Connection closed cleanly');
  } catch (error) {
    console.error(`[MongoDB] Error closing database connection: ${error.message}`);
  }
};

export const getDBConnectionStatus = () => ({
  isConnected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null,
});

export default connectDB;
