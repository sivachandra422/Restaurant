import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

async function dbConnect() {
  // If no MongoDB URI is provided, skip connection (for development without DB)
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not found. Running without database connection.');
    return;
  }

  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't throw error, just log it so app can continue
    console.warn('Continuing without database connection');
  }
}

export default dbConnect; 