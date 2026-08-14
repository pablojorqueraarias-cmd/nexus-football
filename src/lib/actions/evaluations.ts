"use server";

import { randomUUID } from "crypto";
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
  return user.id;
}

export async function createEvaluationAction(playerId: string, formData: FormData) {
  const adminId = await assertAdmin();
  const supabase = await createClient();

  const criterionIds = JSON.parse(String(formData.get("criterion_ids") ?? "[]")) as string[];
  const evaluationId = randomUUID();

  const { error: evalError } = await supabase.from("evaluations").insert({
    id: evaluationId,
    player_id: playerId,
    evaluated_by: adminId,
    strengths: (formData.get("strengths") as string) || null,
    weaknesses: (formData.get("weaknesses") as string) || null,
    conclusion: (formData.get("conclusion") as string) || null,
    match_context: (formData.get("match_context") as string) || null,
  });

  if (evalError) throw new Error(evalError.message);

  const items = criterionIds
    .map((criterionId) => {
      const raw = formData.get(`level_${criterionId}`);
      const level = Number(raw);
      if (!raw || !Number.isInteger(level) || level < 1 || level > 5) return null;
      const comment = (formData.get(`comment_${criterionId}`) as string)?.trim() || null;
      return {
        evaluation_id: evaluationId,
        criterion_id: criterionId,
        level,
        comment,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from("evaluation_items").insert(items);
    if (itemsError) throw new Error(itemsError.message);
  }

  // El jugador vuelve a quedar "sin posición" para que la próxima evaluación
  // se haga de cero, sin arrastrar la posición asignada la vez anterior.
  await supabase.from("players").update({ position_id: null }).eq("id", playerId);

  revalidatePath(`/admin/jugadores/${playerId}`);
  redirect(`/admin/jugadores/${playerId}`);
}

export async function deleteEvaluationAction(evaluationId: string, playerId: string) {
  await assertAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("evaluations").delete().eq("id", evaluationId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/jugadores/${playerId}`);
}
