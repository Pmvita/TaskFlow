import fs from 'node:fs';
import path from 'node:path';
import { pool } from '../src/db/pool.js';

const schema = fs.readFileSync(path.join(process.cwd(), 'src/db/schema.sql'), 'utf8');

beforeAll(async () => {
  await pool.query(schema);
});

beforeEach(async () => {
  await pool.query('TRUNCATE tasks, users RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});
