import mongoose from 'mongoose';
import { env } from './env.js';
import type { DatabaseRepositories } from '../repositories/types.js';
import { createInMemoryRepositories } from '../repositories/inMemoryRepository.js';
import { createMongooseRepositories } from '../repositories/mongooseRepository.js';

let activeRepositories: DatabaseRepositories = createInMemoryRepositories();
let isConnectedToMongo = false;
let persistenceMode: 'mongodb' | 'in_memory' = 'in_memory';
let lastConnectionError: string | null = null;

export async function initDatabase(): Promise<DatabaseRepositories> {
  if (!env.MONGODB_URI) {
    console.log('[Database] MONGODB_URI not configured. Initialized deterministic In-Memory persistence.');
    persistenceMode = 'in_memory';
    activeRepositories = createInMemoryRepositories();
    return activeRepositories;
  }

  try {
    console.log('[Database] Connecting to MongoDB Atlas with 5s timeout...');
    // Never log full connection URI or credentials
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    isConnectedToMongo = true;
    persistenceMode = 'mongodb';
    lastConnectionError = null;
    activeRepositories = createMongooseRepositories();
    console.log('[Database] Successfully connected to MongoDB Atlas. Live persistence active.');
  } catch (error: any) {
    isConnectedToMongo = false;
    persistenceMode = 'in_memory';
    lastConnectionError = error?.message || 'Connection failed';
    console.warn(`[Database] MongoDB connection failed (${lastConnectionError}). Gracefully using verified In-Memory persistence.`);
    activeRepositories = createInMemoryRepositories();
  }

  mongoose.connection.on('disconnected', () => {
    if (persistenceMode === 'mongodb') {
      console.warn('[Database] MongoDB disconnected.');
      isConnectedToMongo = false;
    }
  });

  return activeRepositories;
}

export function getRepositories(): DatabaseRepositories {
  return activeRepositories;
}

export function getDatabaseHealth() {
  return {
    persistenceMode,
    isConnectedToMongo,
    mongoReadyState: mongoose.connection.readyState,
    lastError: lastConnectionError,
  };
}

export async function closeDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[Database] Disconnected from MongoDB.');
  }
}
