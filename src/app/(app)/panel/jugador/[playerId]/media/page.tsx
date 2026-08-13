import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerMediaWithUrls } from "@/lib/data/player-media";
import { PlayerMediaGrid } from "@/components/player-media-grid";

export default async function JugadorMediaPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase.from("players").select("id, full_name").eq("id", playerId).single();
  if (!player) notFound();

  const media = await getPlayerMediaWithUrls(playerId);

  return (
    <div>
      <Link href={`/panel/jugador/${playerId}`} className="text-xs font-semibold uppercase tracking-wide text-ink-900/40 hover:text-brand-500">
        ← {player.full_name}
      </Link>
      <h1 className="font-display mt-1 text-3xl font-bold uppercase tracking-tight text-ink-900">
        Fotos y videos
      </h1>

      <div className="mt-8">
        <PlayerMediaGrid items={media} playerId={playerId} />
      </div>
    </div>
  );
}
