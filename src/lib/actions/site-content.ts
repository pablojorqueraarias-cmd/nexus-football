"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  hero_eyebrow: z.string().min(2, "Muy corto."),
  hero_description: z.string().min(10, "Muy corto."),
  cta_description: z.string().min(10, "Muy corto."),
  footer_description: z.string().min(10, "Muy corto."),
  location: z.string().min(2, "Muy corto."),
  bank_name: z.string().optional(),
  bank_account_type: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_account_holder: z.string().optional(),
  bank_account_rut: z.string().optional(),
  bank_transfer_email: z.string().optional(),
});

export type SiteContentFormState = { success: boolean; error?: string };

export async function updateSiteContentAction(
  _prevState: SiteContentFormState,
  formData: FormData
): Promise<SiteContentFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Solo el administrador puede hacer esto." };
  }

  const parsed = schema.safeParse({
    hero_eyebrow: formData.get("hero_eyebrow"),
    hero_description: formData.get("hero_description"),
    cta_description: formData.get("cta_description"),
    footer_description: formData.get("footer_description"),
    location: formData.get("location"),
    bank_name: formData.get("bank_name"),
    bank_account_type: formData.get("bank_account_type"),
    bank_account_number: formData.get("bank_account_number"),
    bank_account_holder: formData.get("bank_account_holder"),
    bank_account_rut: formData.get("bank_account_rut"),
    bank_transfer_email: formData.get("bank_transfer_email"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { error } = await supabase
    .from("site_content")
    .update({
      ...parsed.data,
      bank_name: parsed.data.bank_name || null,
      bank_account_type: parsed.data.bank_account_type || null,
      bank_account_number: parsed.data.bank_account_number || null,
      bank_account_holder: parsed.data.bank_account_holder || null,
      bank_account_rut: parsed.data.bank_account_rut || null,
      bank_transfer_email: parsed.data.bank_transfer_email || null,
    })
    .eq("id", 1);

  if (error) return { success: false, error: "No se pudo guardar. Intenta de nuevo." };

  revalidatePath("/");
  revalidatePath("/panel/pagos");
  revalidatePath("/panel/jugador", "layout");
  revalidatePath("/admin/contenido");
  return { success: true };
}
