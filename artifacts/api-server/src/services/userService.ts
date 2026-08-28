import { supabase } from "../lib/supabase.js";
import { ok, err, type ServiceResult } from "./types.js";
import { htmlEscape } from "./utils.js";

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  graduation_year: number | null;
  profile_photo: string;
  is_admin: boolean;
}

export interface UserSettings {
  full_name: string;
  email: string;
  profile_photo: string;
  notifications_email: boolean;
  notifications_reminders: boolean;
  notifications_new_clubs: boolean;
  notifications_chat: boolean;
  notifications_digest: boolean;
  notifications_push_mobile: boolean;
  privacy_show_profile: boolean;
  privacy_show_memberships: boolean;
  privacy_allow_dms: boolean;
}

export interface UpdateSettingsInput {
  full_name?: string;
  profile_photo?: string;
  notifications_email?: boolean;
  notifications_reminders?: boolean;
  notifications_new_clubs?: boolean;
  notifications_chat?: boolean;
  notifications_digest?: boolean;
  notifications_push_mobile?: boolean;
  privacy_show_profile?: boolean;
  privacy_show_memberships?: boolean;
  privacy_allow_dms?: boolean;
}

export async function getMe(userId: number): Promise<ServiceResult<UserProfile>> {
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, full_name, graduation_year, profile_photo, is_admin")
    .eq("id", userId)
    .limit(1);

  if (error) throw error;
  if (!users?.[0]) return err(401, "User not found");

  const u = users[0] as UserProfile & { is_admin?: boolean | null };
  return ok({
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    graduation_year: u.graduation_year,
    profile_photo: u.profile_photo,
    is_admin: u.is_admin === true,
  });
}

export async function getSettings(userId: number): Promise<ServiceResult<UserSettings>> {
  const { data: users, error } = await supabase
    .from("users")
    .select("full_name, email, profile_photo, notifications_email, notifications_reminders, notifications_new_clubs, notifications_chat, notifications_digest, notifications_push_mobile, privacy_show_profile, privacy_show_memberships, privacy_allow_dms")
    .eq("id", userId)
    .limit(1);

  if (error) throw error;
  if (!users?.[0]) return err(401, "User not found");

  return ok(users[0] as UserSettings);
}

export async function updateSettings(
  userId: number,
  input: UpdateSettingsInput
): Promise<ServiceResult<UserSettings>> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (input.full_name !== undefined) updates.full_name = htmlEscape(String(input.full_name));
  if (input.profile_photo !== undefined) {
    const url = String(input.profile_photo);
    updates.profile_photo = url.startsWith("https://") ? url : "";
  }
  if (input.notifications_email !== undefined) updates.notifications_email = Boolean(input.notifications_email);
  if (input.notifications_reminders !== undefined) updates.notifications_reminders = Boolean(input.notifications_reminders);
  if (input.notifications_new_clubs !== undefined) updates.notifications_new_clubs = Boolean(input.notifications_new_clubs);
  if (input.notifications_chat !== undefined) updates.notifications_chat = Boolean(input.notifications_chat);
  if (input.notifications_digest !== undefined) updates.notifications_digest = Boolean(input.notifications_digest);
  if (input.notifications_push_mobile !== undefined) updates.notifications_push_mobile = Boolean(input.notifications_push_mobile);
  if (input.privacy_show_profile !== undefined) updates.privacy_show_profile = Boolean(input.privacy_show_profile);
  if (input.privacy_show_memberships !== undefined) updates.privacy_show_memberships = Boolean(input.privacy_show_memberships);
  if (input.privacy_allow_dms !== undefined) updates.privacy_allow_dms = Boolean(input.privacy_allow_dms);

  const { error: updateError } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId);

  if (updateError) throw updateError;

  const { data: users, error: selectError } = await supabase
    .from("users")
    .select("full_name, email, profile_photo, notifications_email, notifications_reminders, notifications_new_clubs, notifications_chat, notifications_digest, notifications_push_mobile, privacy_show_profile, privacy_show_memberships, privacy_allow_dms")
    .eq("id", userId)
    .limit(1);

  if (selectError) throw selectError;
  if (!users?.[0]) return err(401, "User not found");

  return ok(users[0] as UserSettings);
}
