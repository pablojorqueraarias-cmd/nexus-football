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

export type PlayerMediaFormState = { success: boolean; error?: string };

export async function uploadPlayerMediaAction(
  playerId: string,
  _prevState: PlayerMediaFormState,
  formData: FormData
): Promise<PlayerMediaFormState> {
  const adminId = await assertAdmin();
  const supabase = await createClient();

  const mediaType = (formData.get("media_type") as string) === "video" ? "video" : "photo";
  const caption = (formData.get("caption") as string) || null;

  if (mediaType === "photo") {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return { success: false, error: "Selecciona una imagen." };

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${playerId}/media/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
    if (uploadError) return { success: false, error: "No se pudo subir la imagen." };

    const { error: insertError } = await supabase.from("player_media").insert({
      player_id: playerId,
      media_type: "photo",
      storage_path: path,
      caption,
      uploaded_by: adminId,
    });
    if (insertError) return { success: false, error: "No se pudo guardar la foto." };
  } else {
    const videoUrl = (formData.get("video_url") as string)?.trim();
    if (!videoUrl) return { success: false, error: "Pega el link del video." };

    const { error: insertError } = await supabase.from("player_media").insert({
      player_id: playerId,
      media_type: "video",
      video_url: videoUrl,
      caption,
      uploaded_by: adminId,
    });
    if (insertError) return { success: false, error: "No se pudo guardar el video." };
  }

  revalidatePath(`/admin/jugadores/${playerId}`);
  revalidatePath(`/panel/jugador/${playerId}`);
  revalidatePath(`/panel/jugador/${playerId}/media`);
  return { success: true };
}

export async function deletePlayerMediaAction(mediaId: string, storagePath: string | null, playerId: string) {
  await assertAdmin();
  const supabase = await createClient();

  if (storagePath) {
    await supabase.storage.from("documents").remove([storagePath]);
  }
  const { error } = await supabase.from("player_media").delete().eq("id", mediaId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/jugadores/${playerId}`);
  revalidatePath(`/panel/jugador/${playerId}`);
  revalidatePath(`/panel/jugador/${playerId}/media`);
}
