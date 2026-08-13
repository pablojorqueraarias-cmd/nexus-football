"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Solo el administrador puede hacer esto");
}

const matchSchema = z.object({
  match_date: z.string().min(4, "Indica la fecha."),
  opponent: z.string().optional(),
  category_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export async function createMatchAction(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();

  const parsed = matchSchema.parse({
    match_date: formData.get("match_date"),
    opponent: (formData.get("opponent") as string) || undefined,
    category_id: (formData.get("category_id") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  });

  const { data, error } = await supabase.from("matches").insert(parsed).select("id").single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin/partidos");
  redirect(`/admin/partidos/${data.id}`);
}

export async function deleteMatchAction(matchId: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/partidos");
}

export async function saveMatchStatsAction(matchId: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();

  const playerIds = JSON.parse(String(formData.get("player_ids") ?? "[]")) as string[];

  const rows = playerIds.map((playerId) => ({
    match_id: matchId,
    player_id: playerId,
    minutes_played: Number(formData.get(`minutes_${playerId}`) || 0),
    goals: Number(formData.get(`goals_${playerId}`) || 0),
    assists: Number(formData.get(`assists_${playerId}`) || 0),
  }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("player_match_stats")
      .upsert(rows, { onConflict: "match_id,player_id" });
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/admin/partidos/${matchId}`);
  revalidatePath("/admin/ranking");
}
