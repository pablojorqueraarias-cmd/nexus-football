import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { deleteGalleryItemAction } from "@/lib/actions/gallery";
import { publicGalleryUrl } from "@/lib/data/site-content";
import { GalleryUploadForm } from "@/components/admin/gallery-upload-form";
import { VideoEmbed } from "@/components/video-embed";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminGaleriaPage() {
  const supabase = await createClient();
  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase
      .from("gallery_items")
      .select("id, storage_path, media_type, video_url, caption, is_featured, category:categories(name)")
      .order("display_order"),
    supabase.from("categories").select("id, name").neq("name", "General").order("display_order"),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Galería
      </h1>
      <p className="mt-1 text-ink-900/60">Fotos y videos visibles en el sitio público.</p>

      <div className="mt-8">
        <GalleryUploadForm categories={categories ?? []} />
      </div>

      {(!items || items.length === 0) ? (
        <div className="mt-8 rounded-xl border border-dashed border-ink-900/15 p-10 text-center text-ink-900/50">
          No hay fotos ni videos publicados todavía.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => {
            const category = item.category as { name: string } | null;
            return (
              <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg bg-ink-900/5">
                {item.media_type === "video" && item.video_url ? (
                  <VideoEmbed url={item.video_url} className="h-full w-full" />
                ) : (
                  <Image
                    src={publicGalleryUrl(item.storage_path!)}
                    alt={item.caption ?? "Nexus Football"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                )}
                <div className="pointer-events-none absolute left-1 top-1 flex flex-wrap gap-1">
                  {item.is_featured && (
                    <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Destacado
                    </span>
                  )}
                  {category && (
                    <span className="rounded-full bg-ink-900/70 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      {category.name}
                    </span>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <DeleteButton
                    action={deleteGalleryItemAction.bind(null, item.id, item.storage_path)}
                    confirmMessage="¿Eliminar este contenido de la galería?"
                    label="Eliminar"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
