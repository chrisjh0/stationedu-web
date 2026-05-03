import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeToken, TEST_USER } from '../helpers/auth.js';
import { mockDb, chain } from '../__mocks__/workspace-db.js';

describe('User Routes', () => {
  const token = makeToken(1, 'test@test.com');

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/user/me', () => {
    it('happy path - returns user profile', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toMatchObject({
        id: 1,
        email: 'test@test.com',
        full_name: 'Test User',
        graduation_year: 2025,
      });
    });

    it('401 - missing Authorization header', async () => {
      const res = await request(app).get('/api/user/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('401 - invalid JWT', async () => {
      const res = await request(app)
        .get('/api/user/me')
        .set('Authorization', 'Bearer not-a-valid-token');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('401 - valid JWT but user not found in DB (auth middleware)', async () => {
      mockDb.select.mockReturnValueOnce(chain([]));

      const res = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('User not found');
    });

    it('401 - valid JWT, auth passes, but service cannot find user', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .get('/api/user/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('User not found');
    });
  });

  describe('GET /api/user/settings', () => {
    it('happy path - returns user settings', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .get('/api/user/settings')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.settings).toMatchObject({
        full_name: 'Test User',
        email: 'test@test.com',
        notifications_email: true,
        notifications_reminders: true,
        notifications_new_clubs: false,
        notifications_chat: true,
        notifications_digest: true,
        notifications_push_mobile: true,
      });
    });

    it('401 - missing auth', async () => {
      const res = await request(app).get('/api/user/settings');
      expect(res.status).toBe(401);
    });

    it('401 - user not found by service', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .get('/api/user/settings')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('User not found');
    });
  });

  describe('PUT /api/user/settings', () => {
    it('happy path - updates and returns fresh settings', async () => {
      const updated = { ...TEST_USER, full_name: 'Updated Name' };
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([updated]));
      mockDb.update.mockReturnValueOnce(chain(undefined));

      const res = await request(app)
        .put('/api/user/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ full_name: 'Updated Name', notifications_new_clubs: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.settings.full_name).toBe('Updated Name');
    });

    it('401 - missing auth', async () => {
      const res = await request(app).put('/api/user/settings').send({});
      expect(res.status).toBe(401);
    });

    it('401 - user not found after update', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));
      mockDb.update.mockReturnValueOnce(chain(undefined));

      const res = await request(app)
        .put('/api/user/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ full_name: 'Name' });

      expect(res.status).toBe(401);
    });
  });
});
