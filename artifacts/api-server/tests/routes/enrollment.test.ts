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
  id: 10,
  user_id: 1,
  club_id: 1,
  enrolled_at: new Date('2024-01-01'),
};

describe('Enrollment Routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /api/clubs/:id/enroll', () => {
    it('happy path - enrolls user in club', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([]));
      mockDb.insert.mockReturnValueOnce(chain([{ id: 10 }]));

      const res = await request(app)
        .post('/api/clubs/1/enroll')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.enrollment_id).toBe(10);
    });

    it('happy path - idempotent when already enrolled', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_ENROLLMENT]));

      const res = await request(app)
        .post('/api/clubs/1/enroll')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.enrollment_id).toBe(10);
    });

    it('404 - club not found', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .post('/api/clubs/999/enroll')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not found');
    });

    it('404 - invalid club id', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .post('/api/clubs/abc/enroll')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('401 - missing auth', async () => {
      const res = await request(app).post('/api/clubs/1/enroll');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/clubs/:id/unenroll', () => {
    it('happy path - unenrolls user from club', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([]));
      mockDb.delete.mockReturnValueOnce(chain(undefined));

      const res = await request(app)
        .post('/api/clubs/1/unenroll')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('403 - leader cannot unenroll', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([TEST_CLUB]))
        .mockReturnValueOnce(chain([TEST_LEADER]));

      const res = await request(app)
        .post('/api/clubs/1/unenroll')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Leaders cannot unenroll from their own club.');
    });

    it('404 - club not found', async () => {
      mockDb.select
        .mockReturnValueOnce(chain([TEST_USER]))
        .mockReturnValueOnce(chain([]));

      const res = await request(app)
        .post('/api/clubs/999/unenroll')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('404 - invalid club id', async () => {
      mockDb.select.mockReturnValueOnce(chain([TEST_USER]));

      const res = await request(app)
        .post('/api/clubs/abc/unenroll')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('401 - missing auth', async () => {
      const res = await request(app).post('/api/clubs/1/unenroll');
      expect(res.status).toBe(401);
    });
  });
});
