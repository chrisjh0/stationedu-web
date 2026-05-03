import { jest } from '@jest/globals';

export const CLUB_TYPES = ['Committee', 'Union', 'Club', 'Team', 'Other'] as const;
export type ClubType = (typeof CLUB_TYPES)[number];

export const usersTable = {
  id: { name: 'id' },
  email: { name: 'email' },
  full_name: { name: 'full_name' },
  graduation_year: { name: 'graduation_year' },
  notifications_email: { name: 'notifications_email' },
  notifications_reminders: { name: 'notifications_reminders' },
  notifications_new_clubs: { name: 'notifications_new_clubs' },
  notifications_chat: { name: 'notifications_chat' },
  notifications_digest: { name: 'notifications_digest' },
  notifications_push_mobile: { name: 'notifications_push_mobile' },
  updated_at: { name: 'updated_at' },
  $inferInsert: {} as Record<string, unknown>,
} as any;

export const clubsTable = {
  id: { name: 'id' },
  name: { name: 'name' },
  type: { name: 'type' },
  initial: { name: 'initial' },
  default_day: { name: 'default_day' },
  default_location: { name: 'default_location' },
} as any;

export const clubLeadersTable = {
  id: { name: 'id' },
  club_id: { name: 'club_id' },
  user_id: { name: 'user_id' },
  name: { name: 'name' },
  role: { name: 'role' },
  email: { name: 'email' },
} as any;

export const enrollmentsTable = {
  id: { name: 'id' },
  user_id: { name: 'user_id' },
  club_id: { name: 'club_id' },
  enrolled_at: { name: 'enrolled_at' },
} as any;

export const eventsTable = {
  id: { name: 'id' },
  club_id: { name: 'club_id' },
  title: { name: 'title' },
  event_date: { name: 'event_date' },
  event_time: { name: 'event_time' },
  location: { name: 'location' },
  description: { name: 'description' },
} as any;

export const pool = { end: jest.fn() } as any;

export function chain(result: unknown) {
  const c: any = {};
  for (const m of ['from', 'where', 'innerJoin', 'leftJoin', 'set', 'values', 'orderBy', 'limit', 'offset']) {
    c[m] = jest.fn().mockReturnValue(c);
  }
  c.returning = jest.fn().mockResolvedValue(result);
  c.onConflictDoNothing = jest.fn().mockResolvedValue(result);
  c.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
    Promise.resolve(result).then(res, rej);
  c.catch = (rej: (e: unknown) => unknown) => Promise.resolve(result).catch(rej);
  c.finally = (fn: () => void) => Promise.resolve(result).finally(fn);
  return c;
}

export const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const db = mockDb;

export function eq(..._args: unknown[]) { return {}; }
export function and(..._args: unknown[]) { return {}; }
export function gte(..._args: unknown[]) { return {}; }
export function lte(..._args: unknown[]) { return {}; }
export function asc(..._args: unknown[]) { return {}; }
export function sql(..._args: unknown[]) { return {}; }
