"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PlayerStatus } from "@/types/database.types";

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

const playerSchema = z.object({
  full_name: z.string().min(2, "Ingresa el nombre."),
  birth_date: z.string().optional(),
  category_id: z.string().uuid().optional(),
  parent_id: z.string().uuid().optional(),
  status: z.enum(["activo", "inactivo"]),
  notes: z.string().optional(),
});

export async function createPlayerAction(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();

  const parsed = playerSchema.parse({
    full_name: formData.get("full_name"),
    birth_date: (formData.get("birth_date") as string) || undefined,
    category_id: (formData.get("category_id") as string) || undefined,
    parent_id: (formData.get("parent_id") as string) || undefined,
    status: (formData.get("status") as PlayerStatus) || "activo",
    notes: (formData.get("notes") as string) || undefined,
  });

  const { error } = await supabase.from("players").insert(parsed);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/jugadores");
}

export async function updatePlayerAction(playerId: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();

  const parsed = playerSchema.parse({
    full_name: formData.get("full_name"),
    birth_date: (formData.get("birth_date") as string) || undefined,
    category_id: (formData.get("category_id") as string) || undefined,
    parent_id: (formData.get("parent_id") as string) || undefined,
    status: (formData.get("status") as PlayerStatus) || "activo",
    notes: (formData.get("notes") as string) || undefined,
  });

  const { error } = await supabase.from("players").update(parsed).eq("id", playerId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/jugadores");
}

export async function setPlayerStatusAction(playerId: string, status: PlayerStatus) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("players").update({ status }).eq("id", playerId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/jugadores");
}

export async function deletePlayerAction(playerId: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("players").delete().eq("id", playerId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/jugadores");
}
