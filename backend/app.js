import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { mkdirSync } from 'node:fs';

import { getDb } from './db.js';
import { requireAuth, requireAdmin } from './middleware/auth.js';

// Log unhandled promise rejections instead of crashing silently
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
});

const app = express();

// Allow requests only from the configured frontend origin (falls back to "*" for local dev)
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(bodyParser.json());

// Serve uploaded product images from the public folder
if (fs.existsSync('./public')) {
  app.use(express.static('public'));
}

// Ensure the images directory exists on startup
mkdirSync('public/images', { recursive: true });

// Store uploaded images with a timestamp-based filename to avoid collisions
const storage = multer.diskStorage({
  destination: 'public/images/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
// Limit uploads to 5MB per image
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ── Auth ──────────────────────────────────────────────────────────────────────

// Login — verifies email/password and returns a signed JWT token valid for 8 hours
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const db = await getDb();
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Compare submitted password against the stored bcrypt hash
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register — creates a new user account with a bcrypt-hashed password
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    const db = await getDb();
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(409).json({ message: 'Email already in use' });

    // Hash the password with bcrypt before storing — never store plaintext passwords
    const hash = await bcrypt.hash(password, 12);
    await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, 'user']
    );
    res.status(201).json({ message: 'Account created' });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Products ──────────────────────────────────────────────────────────────────

// GET all products, or filter by category using ?category=burgers query param
app.get('/products', async (req, res) => {
  try {
    const db = await getDb();
    const { category } = req.query;
    let rows;
    if (category) {
      [rows] = await db.execute(
        'SELECT * FROM products WHERE category = ? ORDER BY name',
        [category]
      );
    } else {
      [rows] = await db.execute('SELECT * FROM products ORDER BY name');
    }
    res.json(rows);
  } catch (err) {
    console.error('Products error:', err.message);
    res.status(500).json({ message: 'Database error' });
  }
});

// GET a single product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Product error:', err.message);
    res.status(500).json({ message: 'Database error' });
  }
});

// Add a new product — admin only, accepts image upload via multipart/form-data
app.post('/products', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Name and price required' });

    // Generate a short unique ID using the last 8 digits of the current timestamp
    const id = 'p' + Date.now().toString().slice(-8);
    const image = req.file ? `images/${req.file.filename}` : null;

    const db = await getDb();
    await db.execute(
      'INSERT INTO products (id, name, price, description, image, category) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, parseFloat(price), description || '', image, category || null]
    );
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Add product error:', err.message);
    res.status(500).json({ message: 'Database error' });
  }
});

// Update an existing product — admin only, keeps current image if no new one is uploaded
app.put('/products/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const db = await getDb();
    const [existing] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: 'Not found' });

    // Keep the existing image path if no new image was uploaded
    const image = req.file ? `images/${req.file.filename}` : existing[0].image;

    await db.execute(
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
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Update product error:', err.message);
    res.status(500).json({ message: 'Database error' });
  }
});

// Delete a product — admin only
app.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const [existing] = await db.execute('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (!existing[0]) return res.status(404).json({ message: 'Not found' });
    await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete product error:', err.message);
    res.status(500).json({ message: 'Database error' });
  }
});

// ── Orders ────────────────────────────────────────────────────────────────────

// Place a new order — requires auth, validates customer data, saves order + line items
app.post('/orders', requireAuth, async (req, res) => {
  try {
    const { order } = req.body;
    if (!order || !order.items || order.items.length === 0)
      return res.status(400).json({ message: 'Missing data.' });

    const c = order.customer;
    // Basic validation — all customer fields must be present and email must contain @
    if (!c || !c.email?.includes('@') || !c.name?.trim() || !c.street?.trim() ||
        !c['postal-code']?.trim() || !c.city?.trim())
      return res.status(400).json({ message: 'Missing customer data.' });

    const id = randomUUID();
    const db = await getDb();
    await db.execute(
      'INSERT INTO orders (id, user_id, customer_name, customer_email, customer_street, customer_postal_code, customer_city) VALUES (?,?,?,?,?,?,?)',
      [id, req.user.id, c.name, c.email, c.street, c['postal-code'], c.city]
    );

    // Insert each cart item as a separate order_items row
    for (const item of order.items) {
      await db.execute(
        'INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity) VALUES (?,?,?,?,?)',
        [id, item.id, item.name, item.price, item.quantity]
      );
    }

    res.status(201).json({ message: 'Order created!' });
  } catch (err) {
    console.error('Order error:', err.message);
    res.status(500).json({ message: 'Database error' });
  }
});

// GET the logged-in user's own order history, newest first, with items attached
app.get('/orders/my', requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    // Attach line items to each order
    for (const order of orders) {
      const [items] = await db.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }
    res.json(orders);
  } catch (err) {
    console.error('My orders error:', err.message);
    res.status(500).json({ message: 'Database error' });
  }
});

// GET all orders — admin only, newest first, with items attached
app.get('/orders', requireAdmin, async (req, res) => {
  try {
    const db = await getDb();
    const [orders] = await db.execute('SELECT * FROM orders ORDER BY created_at DESC');
    for (const order of orders) {
      const [items] = await db.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }
    res.json(orders);
  } catch (err) {
    console.error('Orders error:', err.message);
    res.status(500).json({ message: 'Database error' });
  }
});

// GET the top 3 most ordered products based on total quantity across all orders
app.get('/popular-products', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT 
        oi.product_id as id,
        oi.product_name as name,
        oi.product_price as price,
        p.image,
        p.category,
        SUM(oi.quantity) as total_ordered
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      GROUP BY oi.product_id, oi.product_name, oi.product_price, p.image, p.category
      ORDER BY total_ordered DESC
      LIMIT 3
    `);
    res.json(rows);
  } catch (err) {
    console.error('Popular products error:', err.message);
    res.status(500).json({ message: 'Database error' });
  }
});

// Handle OPTIONS preflight requests and 404s for unknown routes
app.use((req, res) => {
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  res.status(404).json({ message: 'Not found' });
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));