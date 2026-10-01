import { MongoClient } from 'mongodb';

let client;
let db;

export async function connectDB() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'indi';

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  console.log(`✅ Connected to MongoDB database: "${dbName}"`);
  return db;
}

export async function getDB() {
  if (!db) {
    return await connectDB();
  }
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 MongoDB connection closed.');
  }
}
