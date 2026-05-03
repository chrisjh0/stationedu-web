import { db, clubsTable, clubLeadersTable, enrollmentsTable, eventsTable, usersTable, CLUB_TYPES } from "@workspace/db";
import { eq, and, gte, asc, sql } from "drizzle-orm";
import { ok, err, type ServiceResult } from "./types.js";
import { htmlEscape, todayUtc } from "./utils.js";
import { resolveLeaderStatus } from "./leaderHelpers.js";

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
  const clubs = await db
    .select()
    .from(clubsTable)
    .orderBy(asc(clubsTable.name))
    .limit(limit)
    .offset(offset);
  const enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.user_id, userId));
  const leaders = await db.select().from(clubLeadersTable);

  const enrolledClubIds = new Set(enrollments.map((e) => e.club_id));

  const result: ClubListItem[] = clubs.map((club) => {
    const isEnrolled = enrolledClubIds.has(club.id);
    const clubLeaders = leaders.filter((l) => l.club_id === club.id);
    const isClubLeader = clubLeaders.some(
      (l) => l.user_id === userId || l.email === userEmail
    );
    return {
      id: club.id,
      name: club.name,
      description: club.description,
      type: club.type,
      initial: club.initial,
      default_day: club.default_day,
      default_location: club.default_location,
      chat_link: club.chat_link,
      profile_photo: club.profile_photo,
      is_enrolled: isEnrolled,
      is_leader: isClubLeader,
    };
  });

  return ok(result);
}

export async function listLeadingClubs(
  userId: number,
  userEmail: string
): Promise<ServiceResult<LeadingClub[]>> {
  const today = todayUtc();

  const myLeaderRecords = await db
    .select()
    .from(clubLeadersTable)
    .where(
      sql`(${clubLeadersTable.user_id} = ${userId} OR ${clubLeadersTable.email} = ${userEmail})`
    );

  for (const record of myLeaderRecords) {
    if (!record.user_id) {
      await db
        .update(clubLeadersTable)
        .set({ user_id: userId })
        .where(eq(clubLeadersTable.id, record.id));
    }
  }

  const clubIds = [...new Set(myLeaderRecords.map((l) => l.club_id))];
  if (clubIds.length === 0) {
    return ok([]);
  }

  const result: LeadingClub[] = [];
  for (const clubId of clubIds) {
    const clubArr = await db
      .select()
      .from(clubsTable)
      .where(eq(clubsTable.id, clubId))
      .limit(1);
    if (!clubArr[0]) continue;
    const club = clubArr[0];

    const myRecord = myLeaderRecords.find((l) => l.club_id === clubId);

    const [memberCountArr, upcomingCountArr] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(enrollmentsTable)
        .where(eq(enrollmentsTable.club_id, clubId)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(eventsTable)
        .where(and(eq(eventsTable.club_id, clubId), gte(eventsTable.event_date, today))),
    ]);

    result.push({
      id: club.id,
      name: club.name,
      description: club.description,
      type: club.type,
      initial: club.initial,
      default_day: club.default_day,
      default_location: club.default_location,
      chat_link: club.chat_link,
      profile_photo: club.profile_photo,
      user_role: myRecord?.role ?? "Leader",
      member_count: Number(memberCountArr[0]?.count ?? 0),
      upcoming_events_count: Number(upcomingCountArr[0]?.count ?? 0),
    });
  }

  return ok(result);
}

export async function getClub(
  clubId: number,
  userId: number,
  userEmail: string
): Promise<ServiceResult<ClubDetail>> {
  const clubArr = await db
    .select()
    .from(clubsTable)
    .where(eq(clubsTable.id, clubId))
    .limit(1);

  if (!clubArr[0]) {
    return err(404, "Not found");
  }

  const club = clubArr[0];
  const today = todayUtc();

  const [leaders, enrollment, upcomingEvents] = await Promise.all([
    db.select().from(clubLeadersTable).where(eq(clubLeadersTable.club_id, clubId)),
    db
      .select()
      .from(enrollmentsTable)
      .where(
        and(eq(enrollmentsTable.club_id, clubId), eq(enrollmentsTable.user_id, userId))
      )
      .limit(1),
    db
      .select()
      .from(eventsTable)
      .where(and(eq(eventsTable.club_id, clubId), gte(eventsTable.event_date, today)))
      .orderBy(asc(eventsTable.event_date), asc(eventsTable.event_time)),
  ]);

  const isEnrolled = enrollment.length > 0;
  const isClubLeader = leaders.some(
    (l) => l.user_id === userId || l.email === userEmail
  );

  for (const leader of leaders) {
    if (!leader.user_id && leader.email === userEmail) {
      await db
        .update(clubLeadersTable)
        .set({ user_id: userId })
        .where(eq(clubLeadersTable.id, leader.id));
    }
  }

  return ok({
    id: club.id,
    name: club.name,
    description: club.description,
    type: club.type,
    initial: club.initial,
    default_day: club.default_day,
    default_location: club.default_location,
    chat_link: club.chat_link,
    profile_photo: club.profile_photo,
    is_enrolled: isEnrolled,
    is_leader: isClubLeader,
    leaders: leaders.map((l) => ({ name: l.name, role: l.role, email: l.email })),
    upcoming_events: upcomingEvents.map((e) => ({
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

  if (!name || !name.trim()) {
    return err(400, "Club name is required");
  }

  if (!CLUB_TYPES.includes(type as (typeof CLUB_TYPES)[number])) {
    return err(400, "Invalid club type");
  }

  if (!Array.isArray(leaders) || leaders.length === 0) {
    return err(400, "At least one leader is required");
  }

  const currentUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  const userInLeaders = leaders.some((l) => l.email === (currentUser[0]?.email ?? userEmail));
  if (!userInLeaders) {
    return err(400, "You must include yourself in the leaders list");
  }

  const existing = await db
    .select()
    .from(clubsTable)
    .where(eq(clubsTable.name, name.trim()))
    .limit(1);

  if (existing.length > 0) {
    return err(409, "A club with that name already exists");
  }

  const initial = htmlEscape(name.trim().charAt(0).toUpperCase());
  const [club] = await db
    .insert(clubsTable)
    .values({
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
    .returning();

  const creatorEmail = currentUser[0]?.email ?? userEmail;

  for (const leader of leaders) {
    const isCurrentUser = leader.email === creatorEmail;
    await db.insert(clubLeadersTable).values({
      club_id: club.id,
      user_id: isCurrentUser ? userId : null,
      name: htmlEscape(leader.name),
      role: htmlEscape(leader.role),
      email: leader.email,
    });
  }

  await db
    .insert(enrollmentsTable)
    .values({ user_id: userId, club_id: club.id })
    .onConflictDoNothing();

  return ok({ club_id: club.id });
}

export async function updateClub(
  clubId: number,
  input: CreateClubInput,
  userId: number,
  userEmail: string
): Promise<ServiceResult<void>> {
  const clubArr = await db
    .select()
    .from(clubsTable)
    .where(eq(clubsTable.id, clubId))
    .limit(1);

  if (!clubArr[0]) {
    return err(404, "Not found");
  }

  const isLdr = await resolveLeaderStatus(clubId, userId, userEmail);
  if (!isLdr) {
    return err(403, "You must be a leader of this club");
  }

  const { name, description, type, default_day, default_location, chat_link, profile_photo, leaders } = input;

  if (name && name.trim()) {
    const existing = await db
      .select()
      .from(clubsTable)
      .where(eq(clubsTable.name, name.trim()))
      .limit(1);
    if (existing.length > 0 && existing[0].id !== clubId) {
      return err(409, "A club with that name already exists");
    }
  }

  if (type && !CLUB_TYPES.includes(type as (typeof CLUB_TYPES)[number])) {
    return err(400, "Invalid club type");
  }

  const oldLeaders = await db
    .select()
    .from(clubLeadersTable)
    .where(eq(clubLeadersTable.club_id, clubId));

  const emailToUserId = new Map<string, number | null>();
  for (const l of oldLeaders) {
    emailToUserId.set(l.email, l.user_id);
  }

  const initial = name ? htmlEscape(name.trim().charAt(0).toUpperCase()) : undefined;

  await db
    .update(clubsTable)
    .set({
      ...(name ? { name: htmlEscape(name.trim()), initial } : {}),
      ...(description !== undefined ? { description: htmlEscape(description) } : {}),
      ...(type ? { type } : {}),
      ...(default_day ? { default_day: htmlEscape(default_day) } : {}),
      ...(default_location ? { default_location: htmlEscape(default_location) } : {}),
      ...(chat_link !== undefined ? { chat_link: htmlEscape(chat_link) } : {}),
      ...(profile_photo !== undefined ? { profile_photo } : {}),
      updated_at: new Date(),
    })
    .where(eq(clubsTable.id, clubId));

  if (Array.isArray(leaders)) {
    await db.delete(clubLeadersTable).where(eq(clubLeadersTable.club_id, clubId));
    for (const l of leaders) {
      await db.insert(clubLeadersTable).values({
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
  const clubArr = await db
    .select()
    .from(clubsTable)
    .where(eq(clubsTable.id, clubId))
    .limit(1);

  if (!clubArr[0]) {
    return err(404, "Not found");
  }

  const isLdr = await resolveLeaderStatus(clubId, userId, userEmail);
  if (!isLdr) {
    return err(403, "You must be a leader of this club");
  }

  await db.delete(clubsTable).where(eq(clubsTable.id, clubId));

  return ok(undefined);
}
