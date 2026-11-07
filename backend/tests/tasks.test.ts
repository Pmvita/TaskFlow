import request from 'supertest';
import app from '../src/index.js';

describe('tasks', () => {
  let token: string;
  beforeEach(async () => {
    const r = await request(app).post('/api/auth/register').send({ email: 'u@x.com', password: 'password123' });
    token = r.body.token;
  });

  it('creates and lists tasks', async () => {
    await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({ title: 't1' });
    const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('t1');
  });

  it('updates a task', async () => {
    const c = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({ title: 't1' });
    const res = await request(app).patch(`/api/tasks/${c.body.id}`).set('Authorization', `Bearer ${token}`).send({ status: 'done' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
  });

  it('deletes a task', async () => {
    const c = await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({ title: 't1' });
    const res = await request(app).delete(`/api/tasks/${c.body.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it('requires auth', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });
});
