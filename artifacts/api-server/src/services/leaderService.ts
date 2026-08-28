import { supabase } from "../lib/supabase.js";
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
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id")
    .eq("id", clubId)
    .limit(1);

  if (!clubs?.[0]) return err(404, "Not found");

  const isLdr = await resolveLeaderStatus(clubId, actingUserId, actingUserEmail);
  if (!isLdr) return err(403, "You must be a leader of this club");

  if (!input.name || !input.role || !input.email) {
    return err(400, "name, role, and email are required");
  }

  const { data: matchingUsers } = await supabase
    .from("users")
    .select("id")
    .eq("email", input.email)
    .limit(1);

  const { data: leader, error } = await supabase
    .from("club_leaders")
    .insert({
      club_id: clubId,
      user_id: (matchingUsers?.[0] as { id: number } | undefined)?.id ?? null,
      name: htmlEscape(input.name),
      role: htmlEscape(input.role),
      email: input.email,
    })
    .select("id")
    .single();

  if (error || !leader) throw error;
  return ok({ leader_id: (leader as { id: number }).id });
}

export async function removeLeader(
  clubId: number,
  targetUserId: number,
  actingUserId: number,
  actingUserEmail: string
): Promise<ServiceResult<void>> {
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id")
    .eq("id", clubId)
    .limit(1);

  if (!clubs?.[0]) return err(404, "Not found");

  const isLdr = await resolveLeaderStatus(clubId, actingUserId, actingUserEmail);
  if (!isLdr) return err(403, "You must be a leader of this club");

  const { data: leaderRecords } = await supabase
    .from("club_leaders")
    .select("id")
    .eq("club_id", clubId)
    .eq("user_id", targetUserId)
    .limit(1);

  if (!leaderRecords?.[0]) return err(404, "Not found");

  await supabase
    .from("club_leaders")
    .delete()
    .eq("id", (leaderRecords[0] as { id: number }).id);

  return ok(undefined);
}
