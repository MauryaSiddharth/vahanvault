import mongoose from 'mongoose';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined. Please add it to your environment variables in Vercel or your local environment.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    throw new Error(`Database connection failed: ${e.message}. Please ensure your MONGODB_URI is correct and your database allows connection from all IP addresses (0.0.0.0/0 on MongoDB Atlas Network Access).`);
  }

  return cached.conn;
}

export default dbConnect;

