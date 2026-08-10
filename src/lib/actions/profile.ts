"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  full_name: z.string().min(2, "Ingresa tu nombre."),
  phone: z.string().optional(),
});

export type ProfileFormState = { success: boolean; error?: string };

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  const parsed = schema.safeParse({
    full_name: formData.get("full_name"),
    phone: (formData.get("phone") as string) || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id);

  if (error) return { success: false, error: "No se pudo guardar el perfil." };

  revalidatePath("/panel/perfil");
  return { success: true };
}
