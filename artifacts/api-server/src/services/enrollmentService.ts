import { db, enrollmentsTable, clubsTable, clubLeadersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ok, err, type ServiceResult } from "./types.js";

export async function enroll(
  clubId: number,
  userId: number
): Promise<ServiceResult<{ enrollment_id: number }>> {
  const clubArr = await db
    .select()
    .from(clubsTable)
    .where(eq(clubsTable.id, clubId))
    .limit(1);

  if (!clubArr[0]) {
    return err(404, "Not found");
  }

  const existing = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(eq(enrollmentsTable.user_id, userId), eq(enrollmentsTable.club_id, clubId))
    )
    .limit(1);

  if (existing[0]) {
    return ok({ enrollment_id: existing[0].id });
  }

  const [enrollment] = await db
    .insert(enrollmentsTable)
    .values({ user_id: userId, club_id: clubId })
    .returning();

  return ok({ enrollment_id: enrollment.id });
}

export async function unenroll(
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

  const leaders = await db
    .select()
    .from(clubLeadersTable)
    .where(eq(clubLeadersTable.club_id, clubId));

  const isLdr = leaders.some((l) => l.user_id === userId || l.email === userEmail);
  if (isLdr) {
    return err(403, "Leaders cannot unenroll from their own club.");
  }

  await db
    .delete(enrollmentsTable)
    .where(and(eq(enrollmentsTable.user_id, userId), eq(enrollmentsTable.club_id, clubId)));

  return ok(undefined);
}
