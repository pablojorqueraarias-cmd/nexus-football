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
}

export type GalleryFormState = { success: boolean; error?: string };

export async function uploadGalleryItemAction(
  _prevState: GalleryFormState,
  formData: FormData
): Promise<GalleryFormState> {
  await assertAdmin();
  const supabase = await createClient();

  const file = formData.get("file") as File | null;
  const caption = (formData.get("caption") as string) || null;

  if (!file || file.size === 0) return { success: false, error: "Selecciona una imagen." };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file);
  if (uploadError) return { success: false, error: "No se pudo subir la imagen." };

  const { error: insertError } = await supabase
    .from("gallery_items")
    .insert({ storage_path: path, caption });

  if (insertError) return { success: false, error: "No se pudo guardar la foto." };

  revalidatePath("/admin/galeria");
  revalidatePath("/galeria");
  return { success: true };
}

export async function deleteGalleryItemAction(itemId: string, storagePath: string) {
  await assertAdmin();
  const supabase = await createClient();

  await supabase.storage.from("gallery").remove([storagePath]);
  const { error } = await supabase.from("gallery_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/galeria");
  revalidatePath("/galeria");
}
