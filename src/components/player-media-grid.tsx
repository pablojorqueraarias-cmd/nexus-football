import { VideoEmbed } from "@/components/video-embed";
import { DeleteButton } from "@/components/admin/delete-button";
import { deletePlayerMediaAction } from "@/lib/actions/player-media";
import type { PlayerMediaItem } from "@/lib/data/player-media";

export function PlayerMediaGrid({
  items,
  playerId,
  editable = false,
}: {
  items: PlayerMediaItem[];
  playerId: string;
  editable?: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-900/50">Sin fotos ni videos subidos.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg bg-ink-900/5">
          {item.media_type === "video" && item.video_url ? (
            <VideoEmbed url={item.video_url} className="h-full w-full" />
          ) : item.signedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.signedUrl} alt={item.caption ?? "Foto"} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-ink-900/40">
              No disponible
            </div>
          )}
          {item.caption && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-xs text-white">{item.caption}</p>
            </div>
          )}
          {editable && (
            <div className="absolute right-1 top-1 rounded-md bg-black/60 px-1.5 py-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <DeleteButton
                action={deletePlayerMediaAction.bind(null, item.id, item.storage_path, playerId)}
                confirmMessage="¿Eliminar esta foto o video?"
                label="Eliminar"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
