"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database.types";

async function getSiteOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  return `${proto}://${host}`;
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

export async function inviteUserAction(formData: FormData) {
  await assertAdmin();

  const email = (formData.get("email") as string)?.trim();
  const fullName = (formData.get("full_name") as string)?.trim();
  const role = (formData.get("role") as UserRole) || "parent";

  if (!email || !fullName) throw new Error("Correo y nombre son obligatorios");

  const admin = createAdminClient();
  const origin = await getSiteOrigin();

  let { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: `${origin}/set-password`,
  });

  // Si ya existe una invitación pendiente sin confirmar de un intento
  // anterior, la borramos y reintentamos en vez de fallar.
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

  if (role === "admin" && data.user) {
    await admin.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
  }

  revalidatePath("/admin/usuarios");
}

export async function setUserRoleAction(userId: string, role: UserRole) {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}

export async function setUserAccessAction(userId: string, active: boolean) {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: active ? "none" : "876000h",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}

export async function deleteUserAction(userId: string) {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}
