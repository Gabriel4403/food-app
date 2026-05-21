import mysql from 'mysql2/promise';
import 'dotenv/config';

let db;

export async function getDb() {
  if (db) {
    try {
      await db.ping();
      return db;
    } catch {
      db = null;
    }
  }

  db = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectTimeout: 30000,
  });

  db.on('error', (err) => {
    console.error('DB connection error:', err.message);
    db = null;
  });

  return db;
}