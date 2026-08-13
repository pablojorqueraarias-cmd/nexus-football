"use server";

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

export async function saveAttendanceAction(formData: FormData) {
  const adminId = await assertAdmin();
  const supabase = await createClient();

  const sessionDate = formData.get("session_date") as string;
  if (!sessionDate) throw new Error("Falta la fecha.");

  const playerIds = JSON.parse(String(formData.get("player_ids") ?? "[]")) as string[];

  const rows = playerIds.map((playerId) => ({
    player_id: playerId,
    session_date: sessionDate,
    present: formData.get(`present_${playerId}`) === "on",
    recorded_by: adminId,
  }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("attendance")
      .upsert(rows, { onConflict: "player_id,session_date" });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/asistencia");
}
