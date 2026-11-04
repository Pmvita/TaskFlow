import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { env } from '../config/env.js';

const router = Router();

const registerSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() });
const loginSchema = z.object({ email: z.string().email(), password: z.string() });

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, name } = parsed.data;
  const existing = await query('SELECT id FROM users WHERE email=$1', [email]);
  if (existing.length) return res.status(409).json({ error: 'email in use' });
  const hash = await bcrypt.hash(password, 10);
  const rows = await query<{ id: string }>('INSERT INTO users(email,password_hash,name) VALUES($1,$2,$3) RETURNING id', [email, hash, name ?? null]);
  const token = jwt.sign({ sub: rows[0].id }, env.jwtSecret, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: rows[0].id, email, name } });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const rows = await query<{ id: string; password_hash: string; name: string }>('SELECT id,password_hash,name FROM users WHERE email=$1', [email]);
  if (!rows.length) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ sub: rows[0].id }, env.jwtSecret, { expiresIn: '7d' });
  res.json({ token, user: { id: rows[0].id, email, name: rows[0].name } });
});

export default router;
