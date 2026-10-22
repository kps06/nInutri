require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const required = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.warn(`Missing environment variables: ${missing.join(', ')}`);
}

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: process.env.MYSQL_SSL === 'true' ? { minVersion: 'TLSv1.2' } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication required.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

function validNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    res.status(503).json({ ok: false, database: 'unavailable', error: error.code || 'DATABASE_ERROR' });
  }
});

app.post('/auth/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name?.trim() || !email?.includes('@') || !password || password.length < 8) {
      return res.status(400).json({ error: 'Name, valid email, and an 8-character password are required.' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), passwordHash],
    );
    const user = { id: result.insertId, name: name.trim(), email: email.trim().toLowerCase() };
    res.status(201).json({ user, token: signToken(user) });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'An account already uses this email.' });
    next(error);
  }
});

app.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const [rows] = await pool.execute('SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1', [String(email || '').toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(String(password || ''), user.password_hash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token: signToken(user) });
  } catch (error) {
    next(error);
  }
});

app.get('/scans', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, food_name AS food, food_group AS foodGroup, calories, protein, carbohydrates AS carbs,
              fats, weight, temperature, created_at AS createdAt
       FROM food_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
      [req.user.sub],
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post('/scans', authenticate, async (req, res, next) => {
  try {
    const { food, foodGroup, calories, protein, carbs, fats, weight, temperature } = req.body || {};
    const validGroups = ['Fruit', 'Vegetables', 'Milk products'];
    if (!food?.trim() || !validGroups.includes(foodGroup) || ![calories, protein, carbs, fats, weight, temperature].every(validNumber)) {
      return res.status(400).json({ error: 'The food analysis data is invalid.' });
    }
    const [result] = await pool.execute(
      `INSERT INTO food_analyses
       (user_id, food_name, food_group, calories, protein, carbohydrates, fats, weight, temperature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.sub, food.trim(), foodGroup, calories, protein, carbs, fats, weight, temperature],
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Server error.' });
});

app.listen(port, () => console.log(`nInutri API running at http://localhost:${port}`));
