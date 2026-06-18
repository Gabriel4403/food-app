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

  const connectionConfig = process.env.DATABASE_URL
    ? {
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectTimeout: 30000,
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectTimeout: 30000,
      };

  db = await mysql.createConnection(connectionConfig);

  db.on('error', (err) => {
    console.error('DB connection error:', err.message);
    db = null;
  });

  return db;
}