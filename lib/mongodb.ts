import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;
let connectionPromise: Promise<void> | null = null;

async function dbConnect() {
  // If no MongoDB URI is provided, skip connection (for development without DB)
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not found. Running without database connection.');
    return;
  }

  // Skip connection during build time
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping MongoDB connection during build time');
    return;
  }

  if (isConnected) {
    return;
  }

  // If there's already a connection attempt in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      await mongoose.connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: true, // Changed to true to buffer commands while connecting
      });
      isConnected = true;
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      // Don't throw error, just log it so app can continue
      console.warn('Continuing without database connection');
      // Reset connection flag so we can try again
      isConnected = false;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

export async function connectToDatabase() {
  try {
    // Skip connection during build time
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('Skipping database connection during build time');
      return { db: null };
    }

    await dbConnect();
    
    if (!isConnected) {
      return { db: null };
    }
    
    // Ensure connection is ready
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection to be ready...');
      await new Promise((resolve) => {
        if (mongoose.connection.readyState === 1) {
          resolve(true);
        } else {
          mongoose.connection.once('connected', resolve);
        }
      });
    }
    
    return { db: mongoose.connection.db };
  } catch (error) {
    console.error('Error connecting to database:', error);
    return { db: null };
  }
}

export default dbConnect; 