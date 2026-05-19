import bcrypt from 'bcrypt';
import pool from './db.js';

const email = 'admin@foodapp.com';
const password = 'admin123';

const hash = await bcrypt.hash(password, 12);
await pool.execute(
  'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
  ['Admin', email, hash, 'admin']
);
console.log('Admin created:', email);
process.exit(0);