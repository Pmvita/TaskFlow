import request from 'supertest';
import app from '../src/index.js';

describe('auth', () => {
  it('registers a user', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });
  it('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'password123' });
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'password123' });
    expect(res.status).toBe(409);
  });
  it('logs in', async () => {
    await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
  it('rejects bad login', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nope@x.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});
