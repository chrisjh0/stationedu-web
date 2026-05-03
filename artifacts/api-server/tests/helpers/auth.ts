import jwt from 'jsonwebtoken';

export const TEST_JWT_SECRET = 'clubhub-dev-secret-change-in-production';

export function makeToken(userId = 1, email = 'test@test.com'): string {
  return jwt.sign({ userId, email }, TEST_JWT_SECRET, { expiresIn: '7d' });
}

export const TEST_USER = {
  id: 1,
  email: 'test@test.com',
  full_name: 'Test User',
  graduation_year: 2025,
  notifications_email: true,
  notifications_reminders: true,
  notifications_new_clubs: false,
  notifications_chat: true,
  notifications_digest: true,
  notifications_push_mobile: true,
  created_at: new Date('2024-01-01'),
  updated_at: null,
} as const;
