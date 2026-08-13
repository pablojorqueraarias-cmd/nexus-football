import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PlayerMediaItem = {
  id: string;
  media_type: "photo" | "video";
  video_url: string | null;
  caption: string | null;
  storage_path: string | null;
  signedUrl: string | null;
};

export async function getPlayerMediaWithUrls(playerId: string): Promise<PlayerMediaItem[]> {
  const supabase = await createClient();
  // El select respeta RLS: si este jugador no le pertenece a quien pide la
  // página, esta consulta no devuelve filas.
  const { data } = await supabase
    .from("player_media")
    .select("id, media_type, video_url, caption, storage_path")
    .eq("player_id", playerId)
    .order("uploaded_at", { ascending: false });

  if (!data || data.length === 0) return [];

  const admin = createAdminClient();
  return Promise.all(
    data.map(async (item) => {
      if (item.media_type === "photo" && item.storage_path) {
        const { data: signed } = await admin.storage
          .from("documents")
          .createSignedUrl(item.storage_path, 300);
        return { ...item, signedUrl: signed?.signedUrl ?? null };
      }
      return { ...item, signedUrl: null };
    })
  );
}
