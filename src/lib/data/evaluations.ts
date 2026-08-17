import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getPreviousEvaluation(playerId: string, beforeCreatedAt: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("evaluations")
    .select("created_at, evaluation_items(level, comment, checklist_criteria(label, phase))")
    .eq("player_id", playerId)
    .lt("created_at", beforeCreatedAt)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}
