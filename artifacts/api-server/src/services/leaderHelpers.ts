import { db, clubLeadersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function resolveLeaderStatus(
  clubId: number,
  userId: number,
  userEmail: string
): Promise<boolean> {
  const leaders = await db
    .select()
    .from(clubLeadersTable)
    .where(eq(clubLeadersTable.club_id, clubId));

  const byUserId = leaders.find((l) => l.user_id === userId);
  if (byUserId) return true;

  const byEmail = leaders.find((l) => l.email === userEmail);
  if (byEmail) {
    await db
      .update(clubLeadersTable)
      .set({ user_id: userId })
      .where(eq(clubLeadersTable.id, byEmail.id));
    return true;
  }

  return false;
}
