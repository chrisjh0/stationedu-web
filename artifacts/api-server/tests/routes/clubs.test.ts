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

const TEST_ENROLLMENT = {
  id: 1,
  user_id: 1,
  club_id: 1,
  enrolled_at: new Date('2024-01-01'),
};

describe('Clubs Routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/clubs', () => {
    it('happy path - returns clubs with is_enrolled and is_leader', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_ENROLLMENT]))
        .mockReturnValueOnce(chain([TEST_LEADER]));

      const res = await request(app)
        .get('/api/clubs')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.clubs).toHaveLength(1);
      expect(res.body.clubs[0]).toMatchObject({
        id: 1,
        name: 'Robotics Club',
        is_enrolled: true,
        is_leader: true,
      });
    });

    it('401 - missing auth', async () => {
      const res = await request(app).get('/api/clubs');
      expect(res.status).toBe(401);
    });

    it('returns empty array when no clubs', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]))
        .mockReturnValueOnce(chain([]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .get('/api/clubs')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.clubs).toEqual([]);
    });
  });

  describe('GET /api/clubs/leading', () => {
    it('happy path - returns leading clubs with stats', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_LEADER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([{ count: 5 }]))
        .mockReturnValueOnce(chain([{ count: 2 }]));
      mockDb.update.mockReturnValueOnce(chain(undefined));

      const res = await request(app)
        .get('/api/clubs/leading')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.clubs).toHaveLength(1);
      expect(res.body.clubs[0]).toMatchObject({
        id: 1,
        user_role: 'President',
        member_count: 5,
        upcoming_events_count: 2,
      });
    });

    it('returns empty array when user leads no clubs', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .get('/api/clubs/leading')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.clubs).toEqual([]);
    });

    it('401 - missing auth', async () => {
      const res = await request(app).get('/api/clubs/leading');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/clubs/:id', () => {
    it('happy path - returns full club detail', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_LEADER]))
        .mockReturnValueOnce(chain([TEST_ENROLLMENT]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .get('/api/clubs/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.club).toMatchObject({
        id: 1,
        name: 'Robotics Club',
        is_enrolled: true,
        is_leader: true,
        leaders: [{ name: 'Test User', role: 'President', email: 'test@test.com' }],
        upcoming_events: [],
      });
    });

    it('404 - club not found', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .get('/api/clubs/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not found');
    });

    it('400 - non-numeric id returns bad request', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .get('/api/clubs/abc')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Club ID must be a positive integer');
    });

    it('401 - missing auth', async () => {
      const res = await request(app).get('/api/clubs/1');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/clubs', () => {
    const newClubBody = {
      name: 'New Club',
      description: 'A new club',
      type: 'Club',
      default_day: 'Monday',
      default_location: 'Room 101',
      chat_link: '',
      profile_photo: '',
      leaders: [{ name: 'Test User', role: 'President', email: 'test@test.com' }],
    };

    it('happy path - creates club and returns club_id', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));
      mockDb.insert
        .mockReturnValueOnce(chain([{ id: 42 }]))
        .mockReturnValueOnce(chain([{ id: 1 }]))
        .mockReturnValueOnce(chain(undefined));

      const res = await request(app)
        .post('/api/clubs')
        .set('Authorization', `Bearer ${token}`)
        .send(newClubBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.club_id).toBe(42);
    });

    it('400 - missing club name', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .post('/api/clubs')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...newClubBody, name: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Club name is required');
    });

    it('400 - invalid club type', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .post('/api/clubs')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...newClubBody, type: 'InvalidType' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid club type');
    });

    it('400 - no leaders provided', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .post('/api/clubs')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...newClubBody, leaders: [] });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('At least one leader is required');
    });

    it('400 - current user not in leaders list', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .post('/api/clubs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...newClubBody,
          leaders: [{ name: 'Someone Else', role: 'President', email: 'other@test.com' }],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('You must include yourself in the leaders list');
    });

    it('409 - duplicate club name', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]));

      const res = await request(app)
        .post('/api/clubs')
        .set('Authorization', `Bearer ${token}`)
        .send(newClubBody);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('A club with that name already exists');
    });

    it('401 - missing auth', async () => {
      const res = await request(app).post('/api/clubs').send(newClubBody);
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/clubs/:id', () => {
    const updateBody = {
      name: 'Updated Club',
      description: 'Updated description',
      type: 'Team',
      default_day: 'Wednesday',
      default_location: 'Room 301',
      chat_link: '',
      profile_photo: '',
      leaders: [{ name: 'Test User', role: 'President', email: 'test@test.com' }],
    };

    it('happy path - updates club', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_LEADER]))
        .mockReturnValueOnce(chain([]))
        .mockReturnValueOnce(chain([TEST_LEADER]));
      mockDb.update.mockReturnValueOnce(chain(undefined));
      mockDb.delete.mockReturnValueOnce(chain(undefined));
      mockDb.insert.mockReturnValueOnce(chain([TEST_LEADER]));

      const res = await request(app)
        .put('/api/clubs/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('404 - club not found', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .put('/api/clubs/999')
        .set('Authorization', `Bearer ${token}`)
        .send(updateBody);

      expect(res.status).toBe(404);
    });

    it('403 - user is not a leader', async () => {
      const otherClub = { ...TEST_CLUB, id: 2 };
      const otherLeader = { ...TEST_LEADER, club_id: 2, user_id: 99, email: 'other@test.com' };
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([otherClub]))
        .mockReturnValueOnce(chain([otherLeader]));

      const res = await request(app)
        .put('/api/clubs/2')
        .set('Authorization', `Bearer ${token}`)
        .send(updateBody);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('You must be a leader of this club');
    });

    it('409 - duplicate name on update', async () => {
      const existingOther = { ...TEST_CLUB, id: 99, name: 'Updated Club' };
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_LEADER]))
        .mockReturnValueOnce(chain([existingOther]));

      const res = await request(app)
        .put('/api/clubs/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateBody);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('A club with that name already exists');
    });

    it('400 - non-numeric id returns bad request', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .put('/api/clubs/abc')
        .set('Authorization', `Bearer ${token}`)
        .send(updateBody);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Club ID must be a positive integer');
    });

    it('401 - missing auth', async () => {
      const res = await request(app).put('/api/clubs/1').send(updateBody);
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/clubs/:id', () => {
    it('happy path - deletes club', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_LEADER]));
      mockDb.delete.mockReturnValueOnce(chain(undefined));

      const res = await request(app)
        .delete('/api/clubs/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('404 - club not found', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .delete('/api/clubs/999')
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
        .delete('/api/clubs/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('400 - non-numeric id returns bad request', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .delete('/api/clubs/abc')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Club ID must be a positive integer');
    });

    it('401 - missing auth', async () => {
      const res = await request(app).delete('/api/clubs/1');
      expect(res.status).toBe(401);
    });
  });
});
