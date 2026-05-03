import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ok, err, type ServiceResult } from "./types.js";
import { htmlEscape } from "./utils.js";

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  graduation_year: number | null;
}

export interface UserSettings {
  full_name: string;
  email: string;
  notifications_email: boolean;
  notifications_reminders: boolean;
  notifications_new_clubs: boolean;
  notifications_chat: boolean;
  notifications_digest: boolean;
  notifications_push_mobile: boolean;
}

export interface UpdateSettingsInput {
  full_name?: string;
  notifications_email?: boolean;
  notifications_reminders?: boolean;
  notifications_new_clubs?: boolean;
  notifications_chat?: boolean;
  notifications_digest?: boolean;
  notifications_push_mobile?: boolean;
}

export async function getMe(userId: number): Promise<ServiceResult<UserProfile>> {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!users[0]) {
    return err(401, "User not found");
  }

  const u = users[0];
  return ok({
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    graduation_year: u.graduation_year,
  });
}

export async function getSettings(userId: number): Promise<ServiceResult<UserSettings>> {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!users[0]) {
    return err(401, "User not found");
  }

  const u = users[0];
  return ok({
    full_name: u.full_name,
    email: u.email,
    notifications_email: u.notifications_email,
    notifications_reminders: u.notifications_reminders,
    notifications_new_clubs: u.notifications_new_clubs,
    notifications_chat: u.notifications_chat,
    notifications_digest: u.notifications_digest,
    notifications_push_mobile: u.notifications_push_mobile,
  });
}

export async function updateSettings(
  userId: number,
  input: UpdateSettingsInput
): Promise<ServiceResult<UserSettings>> {
  const updates: Partial<typeof usersTable.$inferInsert> = { updated_at: new Date() };

  if (input.full_name !== undefined) {
    updates.full_name = htmlEscape(String(input.full_name));
  }
  if (input.notifications_email !== undefined) {
    updates.notifications_email = Boolean(input.notifications_email);
  }
  if (input.notifications_reminders !== undefined) {
    updates.notifications_reminders = Boolean(input.notifications_reminders);
  }
  if (input.notifications_new_clubs !== undefined) {
    updates.notifications_new_clubs = Boolean(input.notifications_new_clubs);
  }
  if (input.notifications_chat !== undefined) {
    updates.notifications_chat = Boolean(input.notifications_chat);
  }
  if (input.notifications_digest !== undefined) {
    updates.notifications_digest = Boolean(input.notifications_digest);
  }
  if (input.notifications_push_mobile !== undefined) {
    updates.notifications_push_mobile = Boolean(input.notifications_push_mobile);
  }

  await db.update(usersTable).set(updates).where(eq(usersTable.id, userId));

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!users[0]) {
    return err(401, "User not found");
  }

  const u = users[0];
  return ok({
    full_name: u.full_name,
    email: u.email,
    notifications_email: u.notifications_email,
    notifications_reminders: u.notifications_reminders,
    notifications_new_clubs: u.notifications_new_clubs,
    notifications_chat: u.notifications_chat,
    notifications_digest: u.notifications_digest,
    notifications_push_mobile: u.notifications_push_mobile,
  });
}
