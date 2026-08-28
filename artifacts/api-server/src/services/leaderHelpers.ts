import { supabase } from "../lib/supabase.js";

export async function resolveLeaderStatus(
  clubId: number,
  userId: number,
  userEmail: string
): Promise<boolean> {
  const { data: leaders } = await supabase
    .from("club_leaders")
    .select("id, user_id, email")
    .eq("club_id", clubId);

  if (!leaders) return false;

  const byUserId = leaders.find((l) => l.user_id === userId);
  if (byUserId) return true;

  const byEmail = leaders.find((l) => l.email === userEmail);
  if (byEmail) {
    await supabase
      .from("club_leaders")
      .update({ user_id: userId })
      .eq("id", byEmail.id);
    return true;
  }

  return false;
}
