import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeToken, TEST_USER } from '../helpers/auth.js';
import { mockDb, chain } from '../__mocks__/workspace-db.js';

describe('requireAuth Middleware', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('passes through with valid JWT and existing user', async () => {
    mockDb.select
      .mockReturnValueOnce(chain([TEST_USER]))
      .mockReturnValueOnce(chain([TEST_USER]));

    const token = makeToken(1, 'test@test.com');
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('401 - no Authorization header', async () => {
    const res = await request(app).get('/api/user/me');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ success: false, error: 'Unauthorized' });
  });

  it('401 - Authorization header without Bearer prefix', async () => {
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', 'Token some-token');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('401 - malformed JWT', async () => {
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', 'Bearer not.a.valid.jwt');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('401 - expired JWT', async () => {
    const jwt = await import('jsonwebtoken');
    const expiredToken = jwt.default.sign(
      { userId: 1, email: 'test@test.com' },
      'clubhub-dev-secret-change-in-production',
      { expiresIn: -1 }
    );

    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('401 - JWT signed with wrong secret', async () => {
    const jwt = await import('jsonwebtoken');
    const badToken = jwt.default.sign(
      { userId: 1, email: 'test@test.com' },
      'wrong-secret',
      { expiresIn: '7d' }
    );

    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${badToken}`);

    expect(res.status).toBe(401);
  });

  it('401 - valid JWT but user does not exist in DB', async () => {
    mockDb.select.mockReturnValueOnce(chain([]));

    const token = makeToken(999, 'ghost@test.com');
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('User not found');
  });
});
