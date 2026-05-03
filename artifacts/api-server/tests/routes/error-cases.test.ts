import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeToken, TEST_USER } from '../helpers/auth.js';
import { mockDb, chain } from '../__mocks__/workspace-db.js';

const token = makeToken(1, 'test@test.com');

describe('500 Error Cases (catch blocks)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('GET /api/user/me - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('GET /api/user/settings - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .get('/api/user/settings')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('PUT /api/user/settings - 500 when DB throws', async () => {
    mockDb.select.mockReturnValueOnce(chain([TEST_USER]));
    mockDb.update.mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .put('/api/user/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ full_name: 'Test' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('GET /api/clubs - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .get('/api/clubs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('GET /api/clubs/leading - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .get('/api/clubs/leading')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('GET /api/clubs/:id - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .get('/api/clubs/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('POST /api/clubs - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .post('/api/clubs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Club',
        type: 'Club',
        leaders: [{ name: 'Test User', role: 'President', email: 'test@test.com' }],
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('PUT /api/clubs/:id - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .put('/api/clubs/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated', type: 'Club', leaders: [] });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('DELETE /api/clubs/:id - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .delete('/api/clubs/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('GET /api/clubs/:id/events - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .get('/api/clubs/1/events')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('POST /api/clubs/:id/events - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .post('/api/clubs/1/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Meeting', event_date: '2030-01-01', event_time: '10:00', location: 'Room 1' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('DELETE /api/events/:id - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .delete('/api/events/5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('POST /api/clubs/:id/enroll - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .post('/api/clubs/1/enroll')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('POST /api/clubs/:id/unenroll - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .post('/api/clubs/1/unenroll')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('POST /api/clubs/:id/leaders - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .post('/api/clubs/1/leaders')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Leader', role: 'VP', email: 'leader@test.com' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('DELETE /api/clubs/:id/leaders/:userId - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .delete('/api/clubs/1/leaders/2')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });

  it('GET /api/calendar/events - 500 when DB throws', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await request(app)
      .get('/api/calendar/events?year=2026&month=5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('An unexpected error occurred');
  });
});
