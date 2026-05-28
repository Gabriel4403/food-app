import { getDb } from './db.js';
import bcrypt from 'bcrypt';

const email = 'admin@foodapp.com';
const password = 'admin123';

const hash = await bcrypt.hash(password, 12);
const db = await getDb();
await db.execute(
  'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
  ['Admin', email, hash, 'admin']
);
console.log('Admin created:', email);
process.exit(0);