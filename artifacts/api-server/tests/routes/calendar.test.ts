import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeToken, TEST_USER } from '../helpers/auth.js';
import { mockDb, chain } from '../__mocks__/workspace-db.js';

const token = makeToken(1, 'test@test.com');

const TEST_CALENDAR_EVENT = {
  id: 5,
  club_id: 1,
  club_name: 'Robotics Club',
  title: 'Weekly Meeting',
  event_date: '2026-05-15',
  event_time: '15:30',
  location: 'Room 204',
  description: '',
};

const TEST_ENROLLMENT = {
  id: 1,
  user_id: 1,
  club_id: 1,
  enrolled_at: new Date('2024-01-01'),
};

describe('Calendar Routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/calendar/events', () => {
    it('happy path - returns events for specified month', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CALENDAR_EVENT]))
        .mockReturnValueOnce(chain([TEST_ENROLLMENT]));

      const res = await request(app)
        .get('/api/calendar/events?year=2026&month=5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.events).toHaveLength(1);
      expect(res.body.events[0]).toMatchObject({
        id: 5,
        club_id: 1,
        club_name: 'Robotics Club',
        title: 'Weekly Meeting',
        event_date: '2026-05-15',
        event_time: '15:30',
        location: 'Room 204',
        description: '',
        is_enrolled: true,
      });
    });

    it('happy path - returns events for current month when no params', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .get('/api/calendar/events')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.events).toEqual([]);
    });

    it('marks events from enrolled clubs as is_enrolled: true', async () => {
      const eventFromEnrolledClub = { ...TEST_CALENDAR_EVENT, club_id: 1 };
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([eventFromEnrolledClub]))
        .mockReturnValueOnce(chain([TEST_ENROLLMENT]));

      const res = await request(app)
        .get('/api/calendar/events?year=2026&month=5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.events[0].is_enrolled).toBe(true);
    });

    it('marks events from non-enrolled clubs as is_enrolled: false', async () => {
      const eventFromOtherClub = { ...TEST_CALENDAR_EVENT, club_id: 99 };
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([eventFromOtherClub]))
        .mockReturnValueOnce(chain([TEST_ENROLLMENT]));

      const res = await request(app)
        .get('/api/calendar/events?year=2026&month=5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.events[0].is_enrolled).toBe(false);
    });

    it('400 - only year provided without month', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .get('/api/calendar/events?year=2026')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('year and month must be provided together');
    });

    it('400 - only month provided without year', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .get('/api/calendar/events?month=5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('year and month must be provided together');
    });

    it('400 - invalid month value', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .get('/api/calendar/events?year=2026&month=13')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid year or month');
    });

    it('401 - missing auth', async () => {
      const res = await request(app).get('/api/calendar/events');
      expect(res.status).toBe(401);
    });

    it('401 - invalid token', async () => {
      const res = await request(app)
        .get('/api/calendar/events')
        .set('Authorization', 'Bearer bad-token');
      expect(res.status).toBe(401);
    });
  });
});
