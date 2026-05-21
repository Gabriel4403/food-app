import mysql from 'mysql2/promise';
import 'dotenv/config';

async function createConnection() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  connection.on('error', async (err) => {
    console.error('DB error:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      await createConnection();
    }
  });

  return connection;
}

let db;

export async function getDb() {
  if (!db) {
    db = await createConnection();
  }
  try {
    await db.ping();
  } catch {
    db = await createConnection();
  }
  return db;
}