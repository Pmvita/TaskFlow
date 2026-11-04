import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { auth, AuthedRequest } from '../middleware/auth.js';

const router = Router();
router.use(auth);

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['todo','in_progress','done']).optional(),
  priority: z.enum(['low','medium','high']).optional(),
  due_date: z.string().optional(),
});

router.get('/', async (req: AuthedRequest, res) => {
  const rows = await query('SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC', [req.userId]);
  res.json(rows);
});

router.post('/', async (req: AuthedRequest, res) => {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;
  const rows = await query('INSERT INTO tasks(user_id,title,description,status,priority,due_date) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
    [req.userId, d.title, d.description ?? null, d.status ?? 'todo', d.priority ?? 'medium', d.due_date ?? null]);
  res.status(201).json(rows[0]);
});

router.patch('/:id', async (req: AuthedRequest, res) => {
  const parsed = taskSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const d = parsed.data;
  const rows = await query(
    `UPDATE tasks SET title=COALESCE($1,title), description=COALESCE($2,description), status=COALESCE($3,status), priority=COALESCE($4,priority), due_date=COALESCE($5,due_date), updated_at=now()
     WHERE id=$6 AND user_id=$7 RETURNING *`,
    [d.title ?? null, d.description ?? null, d.status ?? null, d.priority ?? null, d.due_date ?? null, req.params.id, req.userId]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

router.delete('/:id', async (req: AuthedRequest, res) => {
  const rows = await query('DELETE FROM tasks WHERE id=$1 AND user_id=$2 RETURNING id', [req.params.id, req.userId]);
  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.status(204).send();
});

export default router;
