import { supabase } from "../lib/supabase.js";
import { ok, err, type ServiceResult } from "./types.js";
import { htmlEscape, todayUtc } from "./utils.js";
import { resolveLeaderStatus } from "./leaderHelpers.js";

export const CLUB_TYPES = ["Committee", "Union", "Club", "Team", "Other"] as const;
export type ClubType = typeof CLUB_TYPES[number];

export interface ClubListItem {
  id: number;
  name: string;
  description: string;
  type: string;
  initial: string;
  default_day: string;
  default_location: string;
  chat_link: string;
  profile_photo: string;
  is_enrolled: boolean;
  is_leader: boolean;
  member_count: number;
}

export interface LeadingClub {
  id: number;
  name: string;
  description: string;
  type: string;
  initial: string;
  default_day: string;
  default_location: string;
  chat_link: string;
  profile_photo: string;
  user_role: string;
  member_count: number;
  upcoming_events_count: number;
}

export interface ClubLeaderShape {
  name: string;
  role: string;
  email: string;
}

export interface ClubEventShape {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  description: string;
}

export interface ClubDetail extends ClubListItem {
  leaders: ClubLeaderShape[];
  upcoming_events: ClubEventShape[];
}

export interface CreateClubInput {
  name: string;
  description?: string;
  type: string;
  default_day?: string;
  default_location?: string;
  chat_link?: string;
  profile_photo?: string;
  leaders: Array<{ name: string; role: string; email: string }>;
}

export async function listClubs(
  userId: number,
  userEmail: string,
  limit: number = 12,
  offset: number = 0
): Promise<ServiceResult<ClubListItem[]>> {
  const { data: clubs, error: clubError } = await supabase
    .from("clubs")
    .select("id, name, description, type, initial, default_day, default_location, chat_link, profile_photo")
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (clubError) throw clubError;

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("club_id")
    .eq("user_id", userId);

  const { data: leaders } = await supabase
    .from("club_leaders")
    .select("club_id, user_id, email");

  const enrolledClubIds = new Set((enrollments ?? []).map((e: { club_id: number }) => e.club_id));

  const clubIds = (clubs ?? []).map((c: { id: number }) => c.id);
  let memberCountMap = new Map<number, number>();

  if (clubIds.length > 0) {
    const { data: allEnrollments } = await supabase
      .from("enrollments")
      .select("club_id")
      .in("club_id", clubIds);

    for (const e of allEnrollments ?? []) {
      const id = (e as { club_id: number }).club_id;
      memberCountMap.set(id, (memberCountMap.get(id) ?? 0) + 1);
    }
  }

  const result: ClubListItem[] = (clubs ?? []).map((club: Record<string, unknown>) => {
    const clubLeaders = (leaders ?? []).filter((l: { club_id: number }) => l.club_id === (club.id as number));
    const isClubLeader = clubLeaders.some(
      (l: { user_id: number | null; email: string }) => l.user_id === userId || l.email === userEmail
    );
    return {
      id: club.id as number,
      name: club.name as string,
      description: club.description as string,
      type: club.type as string,
      initial: club.initial as string,
      default_day: club.default_day as string,
      default_location: club.default_location as string,
      chat_link: club.chat_link as string,
      profile_photo: club.profile_photo as string,
      is_enrolled: enrolledClubIds.has(club.id as number),
      is_leader: isClubLeader,
      member_count: memberCountMap.get(club.id as number) ?? 0,
    };
  });

  return ok(result);
}

export async function listLeadingClubs(
  userId: number,
  userEmail: string
): Promise<ServiceResult<LeadingClub[]>> {
  const today = todayUtc();

  const { data: myLeaderRecords } = await supabase
    .from("club_leaders")
    .select("id, club_id, user_id, role, email")
    .or(`user_id.eq.${userId},email.eq.${userEmail}`);

  for (const record of myLeaderRecords ?? []) {
    const r = record as { id: number; user_id: number | null };
    if (!r.user_id) {
      await supabase.from("club_leaders").update({ user_id: userId }).eq("id", r.id);
    }
  }

  const clubIds = [...new Set((myLeaderRecords ?? []).map((l: { club_id: number }) => l.club_id))];
  if (clubIds.length === 0) return ok([]);

  const result: LeadingClub[] = [];
  for (const clubId of clubIds) {
    const { data: clubArr } = await supabase
      .from("clubs")
      .select("id, name, description, type, initial, default_day, default_location, chat_link, profile_photo")
      .eq("id", clubId)
      .limit(1);

    if (!clubArr?.[0]) continue;
    const club = clubArr[0] as Record<string, unknown>;

    const myRecord = (myLeaderRecords ?? []).find((l: { club_id: number }) => l.club_id === clubId) as { role: string } | undefined;

    const [{ count: memberCount }, { count: upcomingCount }] = await Promise.all([
      supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("club_id", clubId),
      supabase.from("events").select("*", { count: "exact", head: true }).eq("club_id", clubId).gte("event_date", today),
    ]);

    result.push({
      id: club.id as number,
      name: club.name as string,
      description: club.description as string,
      type: club.type as string,
      initial: club.initial as string,
      default_day: club.default_day as string,
      default_location: club.default_location as string,
      chat_link: club.chat_link as string,
      profile_photo: club.profile_photo as string,
      user_role: myRecord?.role ?? "Leader",
      member_count: memberCount ?? 0,
      upcoming_events_count: upcomingCount ?? 0,
    });
  }

  return ok(result);
}

export async function getClub(
  clubId: number,
  userId: number,
  userEmail: string
): Promise<ServiceResult<ClubDetail>> {
  const { data: clubArr } = await supabase
    .from("clubs")
    .select("id, name, description, type, initial, default_day, default_location, chat_link, profile_photo")
    .eq("id", clubId)
    .limit(1);

  if (!clubArr?.[0]) return err(404, "Not found");
  const club = clubArr[0] as Record<string, unknown>;

  const today = todayUtc();

  const [
    { data: leaders },
    { data: enrollment },
    { data: upcomingEvents },
    { count: memberCount },
  ] = await Promise.all([
    supabase.from("club_leaders").select("id, user_id, name, role, email").eq("club_id", clubId),
    supabase.from("enrollments").select("id").eq("club_id", clubId).eq("user_id", userId).limit(1),
    supabase.from("events").select("id, title, event_date, event_time, location, description").eq("club_id", clubId).gte("event_date", today).order("event_date").order("event_time"),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("club_id", clubId),
  ]);

  const isEnrolled = (enrollment?.length ?? 0) > 0;
  const isClubLeader = (leaders ?? []).some(
    (l: { user_id: number | null; email: string }) => l.user_id === userId || l.email === userEmail
  );

  for (const leader of leaders ?? []) {
    const l = leader as { id: number; user_id: number | null; email: string };
    if (!l.user_id && l.email === userEmail) {
      await supabase.from("club_leaders").update({ user_id: userId }).eq("id", l.id);
    }
  }

  return ok({
    id: club.id as number,
    name: club.name as string,
    description: club.description as string,
    type: club.type as string,
    initial: club.initial as string,
    default_day: club.default_day as string,
    default_location: club.default_location as string,
    chat_link: club.chat_link as string,
    profile_photo: club.profile_photo as string,
    is_enrolled: isEnrolled,
    is_leader: isClubLeader,
    member_count: memberCount ?? 0,
    leaders: (leaders ?? []).map((l: { name: string; role: string; email: string }) => ({
      name: l.name,
      role: l.role,
      email: l.email,
    })),
    upcoming_events: (upcomingEvents ?? []).map((e: ClubEventShape) => ({
      id: e.id,
      title: e.title,
      event_date: e.event_date,
      event_time: e.event_time,
      location: e.location,
      description: e.description,
    })),
  });
}

export async function createClub(
  input: CreateClubInput,
  userId: number,
  userEmail: string
): Promise<ServiceResult<{ club_id: number }>> {
  const { name, description, type, default_day, default_location, chat_link, profile_photo, leaders } = input;

  if (!name || !name.trim()) return err(400, "Club name is required");

  if (!CLUB_TYPES.includes(type as (typeof CLUB_TYPES)[number])) return err(400, "Invalid club type");

  if (!Array.isArray(leaders) || leaders.length === 0) return err(400, "At least one leader is required");

  const { data: currentUsers } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .limit(1);

  const creatorEmail = (currentUsers?.[0] as { email: string } | undefined)?.email ?? userEmail;
  const userInLeaders = leaders.some((l) => l.email === creatorEmail);
  if (!userInLeaders) return err(400, "You must include yourself in the leaders list");

  const { data: existing } = await supabase
    .from("clubs")
    .select("id")
    .eq("name", name.trim())
    .limit(1);

  if (existing?.length) return err(409, "A club with that name already exists");

  const initial = htmlEscape(name.trim().charAt(0).toUpperCase());
  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .insert({
      name: htmlEscape(name.trim()),
      description: htmlEscape(description ?? ""),
      type,
      initial,
      default_day: htmlEscape(default_day ?? ""),
      default_location: htmlEscape(default_location ?? ""),
      chat_link: htmlEscape(chat_link ?? ""),
      profile_photo: profile_photo ?? "",
      creator_user_id: userId,
    })
    .select("id")
    .single();

  if (clubError || !club) throw clubError;
  const clubId = (club as { id: number }).id;

  for (const leader of leaders) {
    const isCurrentUser = leader.email === creatorEmail;
    await supabase.from("club_leaders").insert({
      club_id: clubId,
      user_id: isCurrentUser ? userId : null,
      name: htmlEscape(leader.name),
      role: htmlEscape(leader.role),
      email: leader.email,
    });
  }

  await supabase
    .from("enrollments")
    .upsert({ user_id: userId, club_id: clubId }, { ignoreDuplicates: true });

  return ok({ club_id: clubId });
}

export async function updateClub(
  clubId: number,
  input: CreateClubInput,
  userId: number,
  userEmail: string
): Promise<ServiceResult<void>> {
  const { data: clubArr } = await supabase
    .from("clubs")
    .select("id")
    .eq("id", clubId)
    .limit(1);

  if (!clubArr?.[0]) return err(404, "Not found");

  const isLdr = await resolveLeaderStatus(clubId, userId, userEmail);
  if (!isLdr) return err(403, "You must be a leader of this club");

  const { name, description, type, default_day, default_location, chat_link, profile_photo, leaders } = input;

  if (name && name.trim()) {
    const { data: existing } = await supabase
      .from("clubs")
      .select("id")
      .eq("name", name.trim())
      .limit(1);
    if (existing?.length && (existing[0] as { id: number }).id !== clubId) {
      return err(409, "A club with that name already exists");
    }
  }

  if (type && !CLUB_TYPES.includes(type as (typeof CLUB_TYPES)[number])) {
    return err(400, "Invalid club type");
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name) { updates.name = htmlEscape(name.trim()); updates.initial = htmlEscape(name.trim().charAt(0).toUpperCase()); }
  if (description !== undefined) updates.description = htmlEscape(description);
  if (type) updates.type = type;
  if (default_day) updates.default_day = htmlEscape(default_day);
  if (default_location) updates.default_location = htmlEscape(default_location);
  if (chat_link !== undefined) updates.chat_link = htmlEscape(chat_link);
  if (profile_photo !== undefined) updates.profile_photo = profile_photo;

  await supabase.from("clubs").update(updates).eq("id", clubId);

  if (Array.isArray(leaders)) {
    const { data: oldLeaders } = await supabase
      .from("club_leaders")
      .select("email, user_id")
      .eq("club_id", clubId);

    const emailToUserId = new Map<string, number | null>();
    for (const l of oldLeaders ?? []) {
      const ll = l as { email: string; user_id: number | null };
      emailToUserId.set(ll.email, ll.user_id);
    }

    await supabase.from("club_leaders").delete().eq("club_id", clubId);

    for (const l of leaders) {
      await supabase.from("club_leaders").insert({
        club_id: clubId,
        user_id: emailToUserId.get(l.email) ?? null,
        name: htmlEscape(l.name),
        role: htmlEscape(l.role),
        email: l.email,
      });
    }
  }

  return ok(undefined);
}

export async function deleteClub(
  clubId: number,
  userId: number,
  userEmail: string
): Promise<ServiceResult<void>> {
  const { data: clubArr } = await supabase
    .from("clubs")
    .select("id")
    .eq("id", clubId)
    .limit(1);

  if (!clubArr?.[0]) return err(404, "Not found");

  const isLdr = await resolveLeaderStatus(clubId, userId, userEmail);
  if (!isLdr) return err(403, "You must be a leader of this club");

  await supabase.from("clubs").delete().eq("id", clubId);
  return ok(undefined);
}
