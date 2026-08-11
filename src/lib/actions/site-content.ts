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
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { error } = await supabase
    .from("site_content")
    .update(parsed.data)
    .eq("id", 1);

  if (error) return { success: false, error: "No se pudo guardar. Intenta de nuevo." };

  revalidatePath("/");
  revalidatePath("/admin/contenido");
  return { success: true };
}
