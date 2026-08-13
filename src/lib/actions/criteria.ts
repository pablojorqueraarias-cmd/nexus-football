"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CriterionPhase } from "@/types/database.types";

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

export async function createCriterionAction(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();

  const position_id = (formData.get("position_id") as string) || null;
  const phase = (position_id ? formData.get("phase") : "general") as CriterionPhase;
  const label = (formData.get("label") as string)?.trim();
  const description = (formData.get("description") as string) || null;
  const display_order = Number(formData.get("display_order") || 0);

  if (!label) throw new Error("El criterio necesita una etiqueta");

  const { error } = await supabase.from("checklist_criteria").insert({
    position_id,
    phase,
    label,
    description,
    display_order,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/criterios");
}

export async function updateCriterionAction(criterionId: string, formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();

  const label = (formData.get("label") as string)?.trim();
  const description = (formData.get("description") as string) || null;
  const display_order = Number(formData.get("display_order") || 0);
  const is_active = formData.get("is_active") === "on";

  if (!label) throw new Error("El criterio necesita una etiqueta");

  const { error } = await supabase
    .from("checklist_criteria")
    .update({ label, description, display_order, is_active })
    .eq("id", criterionId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/criterios");
}
