import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  idleTimeout: 60000,
  maxIdle: 10,
  ssl: { rejectUnauthorized: false },
});

export default pool;