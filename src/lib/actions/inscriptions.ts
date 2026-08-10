"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const inscriptionSchema = z.object({
  child_full_name: z.string().min(2, "Ingresa el nombre del niño/a."),
  birth_date: z.string().optional(),
  desired_category_id: z.string().uuid().optional(),
  parent_full_name: z.string().min(2, "Ingresa tu nombre."),
  parent_email: z.string().email("Ingresa un correo válido."),
  parent_phone: z.string().optional(),
  message: z.string().optional(),
});

export type InscriptionFormState = { success: boolean; error?: string };

export async function submitInscriptionAction(
  _prevState: InscriptionFormState,
  formData: FormData
): Promise<InscriptionFormState> {
  const parsed = inscriptionSchema.safeParse({
    child_full_name: formData.get("child_full_name"),
    birth_date: (formData.get("birth_date") as string) || undefined,
    desired_category_id: (formData.get("desired_category_id") as string) || undefined,
    parent_full_name: formData.get("parent_full_name"),
    parent_email: formData.get("parent_email"),
    parent_phone: (formData.get("parent_phone") as string) || undefined,
    message: (formData.get("message") as string) || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("inscriptions").insert(parsed.data);

    if (error) {
      return { success: false, error: "No se pudo enviar la inscripción. Intenta de nuevo." };
    }

    return { success: true };
  } catch {
    return { success: false, error: "No se pudo enviar la inscripción. Intenta de nuevo." };
  }
}

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
  const { headers } = await import("next/headers");
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  return `${proto}://${host}`;
}

export async function approveInscriptionAction(inscriptionId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: inscription, error: fetchError } = await admin
    .from("inscriptions")
    .select("*")
    .eq("id", inscriptionId)
    .single();

  if (fetchError || !inscription) throw new Error("No se encontró la inscripción.");
  if (inscription.status !== "pendiente") throw new Error("Esta inscripción ya fue revisada.");

  // Busca o invita al apoderado.
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  let parentId = existingUsers?.users.find((u) => u.email === inscription.parent_email)?.id;

  if (!parentId) {
    const origin = await getSiteOrigin();
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      inscription.parent_email,
      {
        data: { full_name: inscription.parent_full_name },
        redirectTo: `${origin}/set-password`,
      }
    );
    if (inviteError) throw new Error(inviteError.message);
    parentId = invited.user?.id;
  }

  const { data: player, error: playerError } = await admin
    .from("players")
    .insert({
      full_name: inscription.child_full_name,
      birth_date: inscription.birth_date,
      category_id: inscription.desired_category_id,
      parent_id: parentId,
      status: "activo",
    })
    .select()
    .single();

  if (playerError) throw new Error(playerError.message);

  await admin
    .from("inscriptions")
    .update({
      status: "aprobada",
      reviewed_by: user?.id,
      created_player_id: player.id,
    })
    .eq("id", inscriptionId);

  revalidatePath("/admin/inscripciones");
  revalidatePath("/admin/jugadores");
}

export async function rejectInscriptionAction(inscriptionId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await admin
    .from("inscriptions")
    .update({ status: "rechazada", reviewed_by: user?.id })
    .eq("id", inscriptionId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/inscripciones");
}
