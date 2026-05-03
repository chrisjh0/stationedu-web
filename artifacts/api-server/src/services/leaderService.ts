import { db, clubsTable, clubLeadersTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ok, err, type ServiceResult } from "./types.js";
import { htmlEscape } from "./utils.js";
import { resolveLeaderStatus } from "./leaderHelpers.js";

export interface AddLeaderInput {
  name: string;
  role: string;
  email: string;
}

export async function addLeader(
  clubId: number,
  input: AddLeaderInput,
  actingUserId: number,
  actingUserEmail: string
): Promise<ServiceResult<{ leader_id: number }>> {
  const clubArr = await db
    .select()
    .from(clubsTable)
    .where(eq(clubsTable.id, clubId))
    .limit(1);

  if (!clubArr[0]) {
    return err(404, "Not found");
  }

  const isLdr = await resolveLeaderStatus(clubId, actingUserId, actingUserEmail);
  if (!isLdr) {
    return err(403, "You must be a leader of this club");
  }

  if (!input.name || !input.role || !input.email) {
    return err(400, "name, role, and email are required");
  }

  const matchingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, input.email))
    .limit(1);

  const [leader] = await db
    .insert(clubLeadersTable)
    .values({
      club_id: clubId,
      user_id: matchingUser[0]?.id ?? null,
      name: htmlEscape(input.name),
      role: htmlEscape(input.role),
      email: input.email,
    })
    .returning();

  return ok({ leader_id: leader.id });
}

export async function removeLeader(
  clubId: number,
  targetUserId: number,
  actingUserId: number,
  actingUserEmail: string
): Promise<ServiceResult<void>> {
  const clubArr = await db
    .select()
    .from(clubsTable)
    .where(eq(clubsTable.id, clubId))
    .limit(1);

  if (!clubArr[0]) {
    return err(404, "Not found");
  }

  const isLdr = await resolveLeaderStatus(clubId, actingUserId, actingUserEmail);
  if (!isLdr) {
    return err(403, "You must be a leader of this club");
  }

  const leaderRecord = await db
    .select()
    .from(clubLeadersTable)
    .where(
      and(
        eq(clubLeadersTable.club_id, clubId),
        eq(clubLeadersTable.user_id, targetUserId)
      )
    )
    .limit(1);

  if (!leaderRecord[0]) {
    return err(404, "Not found");
  }

  await db
    .delete(clubLeadersTable)
    .where(eq(clubLeadersTable.id, leaderRecord[0].id));

  return ok(undefined);
}
