"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

async function getSiteOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  return `${proto}://${host}`;
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

export async function setPlayerScholarshipAction(playerId: string, isScholarship: boolean) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("players")
    .update({ is_scholarship: isScholarship })
    .eq("id", playerId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/pagos");
  revalidatePath("/admin/jugadores");
}

export async function setPlayerPositionAction(playerId: string, positionId: string | null) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("players")
    .update({ position_id: positionId })
    .eq("id", playerId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/jugadores/${playerId}`);
}

export async function invitePlayerAction(playerId: string, formData: FormData) {
  await assertAdmin();

  const email = (formData.get("player_email") as string)?.trim();
  const fullName = (formData.get("player_full_name") as string)?.trim();

  if (!email || !fullName) throw new Error("Correo y nombre son obligatorios");

  const admin = createAdminClient();
  const origin = await getSiteOrigin();

  let { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: `${origin}/set-password`,
  });

  if (error && error.code === "email_exists") {
    const { data: existing } = await admin.auth.admin.listUsers();
    const previous = existing?.users.find((u) => u.email === email);

    if (previous && !previous.email_confirmed_at) {
      await admin.auth.admin.deleteUser(previous.id);
      ({ data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName },
        redirectTo: `${origin}/set-password`,
      }));
    } else if (previous) {
      throw new Error("Ese correo ya tiene una cuenta activa.");
    }
  }

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("No se pudo crear la cuenta.");

  await admin.from("profiles").update({ role: "player" }).eq("id", data.user.id);
  await admin.from("players").update({ user_id: data.user.id }).eq("id", playerId);

  revalidatePath(`/admin/jugadores/${playerId}`);
}
