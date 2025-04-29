// src/lib/connect.ts
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config(); 

const MONGODB_URI = process.env.DATABASE_URL || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env');
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      // Optional settings
      dbName: 'your-database-name', // optional
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

export default connectDB;
