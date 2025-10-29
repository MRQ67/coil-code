import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Add MONGODB_URI to .env.local');
}

const uri = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// MongoDB connection options to improve performance and avoid timeouts
const options = {
  serverSelectionTimeoutMS: 5000, // Wait 5 seconds for server selection before timing out
  socketTimeoutMS: 45000,         // Close sockets after 45 seconds of inactivity
  maxPoolSize: 10,                // Maintain up to 10 socket connections
  minPoolSize: 2,                 // Maintain minimum 2 socket connections
  maxIdleTimeMS: 30000,           // Close connections after 30 seconds of inactivity
  connectTimeoutMS: 10000,        // Give up initial connection attempt after 10 seconds
};

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;