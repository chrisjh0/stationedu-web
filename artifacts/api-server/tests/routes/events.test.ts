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

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const FUTURE_DATE = tomorrow.toISOString().split('T')[0];

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const PAST_DATE = yesterday.toISOString().split('T')[0];

const TEST_EVENT = {
  id: 5,
  club_id: 1,
  title: 'Weekly Meeting',
  event_date: FUTURE_DATE,
  event_time: '15:30',
  location: 'Room 204',
  description: '',
  created_at: new Date('2024-01-01'),
};

describe('Events Routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/clubs/:id/events', () => {
    it('happy path - returns upcoming events', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_EVENT]));

      const res = await request(app)
        .get('/api/clubs/1/events')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.events).toHaveLength(1);
      expect(res.body.events[0]).toMatchObject({
        id: 5,
        title: 'Weekly Meeting',
        event_date: FUTURE_DATE,
        event_time: '15:30',
        location: 'Room 204',
        description: '',
      });
    });

    it('404 - club not found', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .get('/api/clubs/999/events')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not found');
    });

    it('401 - missing auth', async () => {
      const res = await request(app).get('/api/clubs/1/events');
      expect(res.status).toBe(401);
    });

    it('404 - invalid id', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .get('/api/clubs/abc/events')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/clubs/:id/events', () => {
    const eventBody = {
      title: 'Weekly Meeting',
      event_date: FUTURE_DATE,
      event_time: '15:30',
      location: 'Room 204',
      description: '',
    };

    it('happy path - creates event', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_LEADER]));
      mockDb.insert.mockReturnValueOnce(chain([{ id: 5 }]));

      const res = await request(app)
        .post('/api/clubs/1/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.event_id).toBe(5);
    });

    it('404 - club not found', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .post('/api/clubs/999/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventBody);

      expect(res.status).toBe(404);
    });

    it('403 - user is not a leader', async () => {
      const otherLeader = { ...TEST_LEADER, user_id: 99, email: 'other@test.com' };
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([otherLeader]));

      const res = await request(app)
        .post('/api/clubs/1/events')
        .set('Authorization', `Bearer ${token}`)
        .send(eventBody);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('You must be a leader of this club');
    });

    it('400 - missing required fields', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_LEADER]));

      const res = await request(app)
        .post('/api/clubs/1/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Meeting' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('400 - past event date', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_LEADER]));

      const res = await request(app)
        .post('/api/clubs/1/events')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...eventBody, event_date: PAST_DATE });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Event date must be today or in the future');
    });

    it('401 - missing auth', async () => {
      const res = await request(app).post('/api/clubs/1/events').send(eventBody);
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('happy path - deletes event', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_EVENT]))
        .mockReturnValueOnce(chain([TEST_LEADER]));
      mockDb.delete.mockReturnValueOnce(chain(undefined));

      const res = await request(app)
        .delete('/api/events/5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('404 - event not found', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .delete('/api/events/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not found');
    });

    it('403 - user is not a leader of the club', async () => {
      const otherLeader = { ...TEST_LEADER, user_id: 99, email: 'other@test.com' };
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_EVENT]))
        .mockReturnValueOnce(chain([otherLeader]));

      const res = await request(app)
        .delete('/api/events/5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('404 - invalid id', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .delete('/api/events/abc')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('401 - missing auth', async () => {
      const res = await request(app).delete('/api/events/5');
      expect(res.status).toBe(401);
    });
  });
});
