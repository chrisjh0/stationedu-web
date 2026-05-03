import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeToken, TEST_USER } from '../helpers/auth.js';
import { mockDb, chain } from '../__mocks__/workspace-db.js';

const token = makeToken(1, 'test@test.com');

const TEST_CLUB = {
  id: 1,
  name: 'Robotics Club',
  description: 'We build robots.',
  type: 'Club',
  initial: 'R',
  default_day: 'Tuesday',
  default_location: 'Room 204',
  chat_link: '',
  profile_photo: '',
  creator_user_id: 1,
  created_at: new Date('2024-01-01'),
  updated_at: null,
};

const TEST_LEADER = {
  id: 1,
  club_id: 1,
  user_id: 1,
  name: 'Test User',
  role: 'President',
  email: 'test@test.com',
  created_at: new Date('2024-01-01'),
};

describe('Leaders Routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /api/clubs/:id/leaders', () => {
    const leaderBody = {
      name: 'New Leader',
      role: 'Vice President',
      email: 'newleader@test.com',
    };

    it('happy path - adds a leader to the club', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_LEADER]))
        .mockReturnValueOnce(chain([]));
      mockDb.insert.mockReturnValueOnce(chain([{ id: 7 }]));

      const res = await request(app)
        .post('/api/clubs/1/leaders')
        .set('Authorization', `Bearer ${token}`)
        .send(leaderBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.leader_id).toBe(7);
    });

    it('404 - club not found', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .post('/api/clubs/999/leaders')
        .set('Authorization', `Bearer ${token}`)
        .send(leaderBody);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not found');
    });

    it('403 - user is not a leader', async () => {
      const otherLeader = { ...TEST_LEADER, user_id: 99, email: 'other@test.com' };
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([otherLeader]));

      const res = await request(app)
        .post('/api/clubs/1/leaders')
        .set('Authorization', `Bearer ${token}`)
        .send(leaderBody);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('You must be a leader of this club');
    });

    it('400 - missing required fields', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_LEADER]));

      const res = await request(app)
        .post('/api/clubs/1/leaders')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Leader' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('name, role, and email are required');
    });

    it('404 - invalid club id', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .post('/api/clubs/abc/leaders')
        .set('Authorization', `Bearer ${token}`)
        .send(leaderBody);

      expect(res.status).toBe(404);
    });

    it('401 - missing auth', async () => {
      const res = await request(app).post('/api/clubs/1/leaders').send(leaderBody);
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/clubs/:id/leaders/:userId', () => {
    it('happy path - removes a leader from the club', async () => {
      const targetLeader = { ...TEST_LEADER, id: 3, user_id: 2, email: 'other@test.com' };
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_LEADER]))
        .mockReturnValueOnce(chain([targetLeader]));
      mockDb.delete.mockReturnValueOnce(chain(undefined));

      const res = await request(app)
        .delete('/api/clubs/1/leaders/2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('404 - club not found', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .delete('/api/clubs/999/leaders/2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('403 - user is not a leader', async () => {
      const otherLeader = { ...TEST_LEADER, user_id: 99, email: 'other@test.com' };
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([otherLeader]));

      const res = await request(app)
        .delete('/api/clubs/1/leaders/2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('404 - target leader not found', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_LEADER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .delete('/api/clubs/1/leaders/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('404 - invalid club or user id', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .delete('/api/clubs/abc/leaders/xyz')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('401 - missing auth', async () => {
      const res = await request(app).delete('/api/clubs/1/leaders/2');
      expect(res.status).toBe(401);
    });
  });
});
