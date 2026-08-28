import { supabase } from "../lib/supabase.js";
import { ok, err, type ServiceResult } from "./types.js";

export async function enroll(
  clubId: number,
  userId: number
): Promise<ServiceResult<{ enrollment_id: number }>> {
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id")
    .eq("id", clubId)
    .limit(1);

  if (!clubs?.[0]) return err(404, "Not found");

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("club_id", clubId)
    .limit(1);

  if (existing?.[0]) return ok({ enrollment_id: existing[0].id });

  const { data: enrollment, error } = await supabase
    .from("enrollments")
    .insert({ user_id: userId, club_id: clubId })
    .select("id")
    .single();

  if (error || !enrollment) throw error;
  return ok({ enrollment_id: (enrollment as { id: number }).id });
}

export async function unenroll(
  clubId: number,
  userId: number,
  userEmail: string
): Promise<ServiceResult<void>> {
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id")
    .eq("id", clubId)
    .limit(1);

  if (!clubs?.[0]) return err(404, "Not found");

  const { data: leaders } = await supabase
    .from("club_leaders")
    .select("user_id, email")
    .eq("club_id", clubId);

  const isLdr = (leaders ?? []).some(
    (l: { user_id: number | null; email: string }) => l.user_id === userId || l.email === userEmail
  );
  if (isLdr) return err(403, "Leaders cannot unenroll from their own club.");

  await supabase
    .from("enrollments")
    .delete()
    .eq("user_id", userId)
    .eq("club_id", clubId);

  return ok(undefined);
}
