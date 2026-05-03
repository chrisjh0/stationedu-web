import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { makeToken, TEST_USER } from '../helpers/auth.js';
import { mockDb, chain } from '../__mocks__/workspace-db.js';
import { generateToken } from '../../src/middlewares/auth.js';

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

describe('Service edge cases', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('generateToken', () => {
    it('returns a JWT string', () => {
      const t = generateToken(42, 'someone@test.com');
      expect(typeof t).toBe('string');
      expect(t.split('.').length).toBe(3);
    });
  });

  describe('leaderHelpers - byEmail path', () => {
    it('resolves leader by email when user_id is null and updates it', async () => {
      const leaderByEmail = {
        id: 5,
        club_id: 1,
        user_id: null,
        name: 'Test User',
        role: 'President',
        email: 'test@test.com',
        created_at: new Date(),
      };

      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([leaderByEmail]));
      mockDb.update.mockReturnValueOnce(chain(undefined));
      mockDb.delete.mockReturnValueOnce(chain(undefined));

      const res = await request(app)
        .delete('/api/clubs/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 403 when no leader matches by userId or email', async () => {
      const strangerLeader = {
        id: 5,
        club_id: 1,
        user_id: 99,
        name: 'Other',
        role: 'President',
        email: 'other@test.com',
        created_at: new Date(),
      };

      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([strangerLeader]));

      const res = await request(app)
        .delete('/api/clubs/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('updateSettings - all boolean fields', () => {
    it('updates all notification fields at once', async () => {
      const updatedUser = {
        ...TEST_USER,
        notifications_email: false,
        notifications_reminders: false,
        notifications_new_clubs: true,
        notifications_chat: false,
        notifications_digest: false,
        notifications_push_mobile: false,
      };
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([updatedUser]));
      mockDb.update.mockReturnValueOnce(chain(undefined));

      const res = await request(app)
        .put('/api/user/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          full_name: 'Test User',
          notifications_email: false,
          notifications_reminders: false,
          notifications_new_clubs: true,
          notifications_chat: false,
          notifications_digest: false,
          notifications_push_mobile: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.settings.notifications_new_clubs).toBe(true);
      expect(res.body.settings.notifications_email).toBe(false);
    });
  });

  describe('clubService - listLeadingClubs with null user_id leader', () => {
    it('updates leader user_id when found by email (null user_id)', async () => {
      const leaderNullUserId = {
        id: 1,
        club_id: 1,
        user_id: null,
        name: 'Test User',
        role: 'President',
        email: 'test@test.com',
        created_at: new Date(),
      };

      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([leaderNullUserId]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([{ count: 3 }]))
        .mockReturnValueOnce(chain([{ count: 1 }]));
      mockDb.update.mockReturnValueOnce(chain(undefined));

      const res = await request(app)
        .get('/api/clubs/leading')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.clubs).toHaveLength(1);
      expect(res.body.clubs[0].member_count).toBe(3);
      expect(res.body.clubs[0].upcoming_events_count).toBe(1);
    });
  });

  describe('clubService - getClub with email-only leader', () => {
    it('updates leader user_id when found by email in getClub', async () => {
      const leaderByEmail = {
        id: 2,
        club_id: 1,
        user_id: null,
        name: 'Test User',
        role: 'President',
        email: 'test@test.com',
        created_at: new Date(),
      };
      const enrollment = {
        id: 1,
        user_id: 1,
        club_id: 1,
        enrolled_at: new Date(),
      };

      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([leaderByEmail]))
        .mockReturnValueOnce(chain([enrollment]))
        .mockReturnValueOnce(chain([]));
      mockDb.update.mockReturnValueOnce(chain(undefined));

      const res = await request(app)
        .get('/api/clubs/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.club.is_leader).toBe(true);
    });
  });

  describe('clubService - updateClub with no leaders array', () => {
    it('200 - updates club fields without touching leaders', async () => {
      const existingLeader = {
        id: 1,
        club_id: 1,
        user_id: 1,
        name: 'Test User',
        role: 'President',
        email: 'test@test.com',
        created_at: new Date(),
      };

      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([existingLeader]))
        .mockReturnValueOnce(chain([]))
        .mockReturnValueOnce(chain([existingLeader]));
      mockDb.update.mockReturnValueOnce(chain(undefined));

      const res = await request(app)
        .put('/api/clubs/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Updated description', type: 'Team' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('clubService - 400 invalid type on update', () => {
    it('returns 400 for invalid club type on PUT', async () => {
      const existingLeader = {
        id: 1,
        club_id: 1,
        user_id: 1,
        name: 'Test User',
        role: 'President',
        email: 'test@test.com',
        created_at: new Date(),
      };

      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([existingLeader]));

      const res = await request(app)
        .put('/api/clubs/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'InvalidType' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid club type');
    });
  });
});
