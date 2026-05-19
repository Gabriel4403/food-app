import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'node:fs'

import pool from './db.js';
import { requireAuth, requireAdmin } from './middleware/auth.js';

const app = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
app.use(bodyParser.json());
if (fs.existsSync('./public')) {
  app.use(express.static('public'));
}

// Image upload config
const storage = multer.diskStorage({
  destination: 'public/images/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ── Auth ──────────────────────────────────────────────────────────────────────

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'All fields required' });

  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0)
    return res.status(409).json({ message: 'Email already in use' });

  const hash = await bcrypt.hash(password, 12);
  await pool.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, 'user']
  );
  res.status(201).json({ message: 'Account created' });
});

// ── Products ──────────────────────────────────────────────────────────────────

app.get('/products', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM products ORDER BY name');
  res.json(rows);
});

app.get('/products/:id', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
});

app.get('/categories/:category', async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM products WHERE category = ? ORDER BY name',
    [req.params.category]
  );
  res.json(rows);
});

app.post('/products', requireAdmin, upload.single('image'), async (req, res) => {
  const { name, price, description, category } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'Name and price required' });

  const id = 'p' + Date.now();
  const image = req.file ? `images/${req.file.filename}` : null;

  await pool.execute(
  'INSERT INTO products (id, name, price, description, image, category) VALUES (?, ?, ?, ?, ?, ?)',
  [id, name, parseFloat(price), description || '', image, category || 'burgers']
);
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
  res.status(201).json(rows[0]);
});

app.put('/products/:id', requireAdmin, upload.single('image'), async (req, res) => {
  const { name, price, description, category } = req.body;
  const [existing] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!existing[0]) return res.status(404).json({ message: 'Not found' });

  const image = req.file ? `images/${req.file.filename}` : existing[0].image;

  await pool.execute(
  'UPDATE products SET name=?, price=?, description=?, image=?, category=? WHERE id=?',
  [
    name || existing[0].name,
    price ? parseFloat(price) : existing[0].price,
    description ?? existing[0].description,
    image,
    category || existing[0].category,
    req.params.id,
  ]
);
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

app.delete('/products/:id', requireAdmin, async (req, res) => {
  const [existing] = await pool.execute('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!existing[0]) return res.status(404).json({ message: 'Not found' });
  await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// ── Orders ────────────────────────────────────────────────────────────────────

app.post('/orders', async (req, res) => {
  const { order } = req.body;
  if (!order || !order.items || order.items.length === 0)
    return res.status(400).json({ message: 'Missing data.' });

  const c = order.customer;
  if (!c || !c.email?.includes('@') || !c.name?.trim() || !c.street?.trim() ||
      !c['postal-code']?.trim() || !c.city?.trim())
    return res.status(400).json({ message: 'Missing customer data.' });

  const id = randomUUID();
  await pool.execute(
    'INSERT INTO orders (id, customer_name, customer_email, customer_street, customer_postal_code, customer_city) VALUES (?,?,?,?,?,?)',
    [id, c.name, c.email, c.street, c['postal-code'], c.city]
  );

  for (const item of order.items) {
    await pool.execute(
      'INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity) VALUES (?,?,?,?,?)',
      [id, item.id, item.name, item.price, item.quantity]
    );
  }

  res.status(201).json({ message: 'Order created!' });
});

app.get('/orders', requireAdmin, async (req, res) => {
  const [orders] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC');
  for (const order of orders) {
    const [items] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;
  }
  res.json(orders);
});

app.use((req, res) => {
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  res.status(404).json({ message: 'Not found' });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));