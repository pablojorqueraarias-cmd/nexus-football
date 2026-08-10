import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { deleteGalleryItemAction } from "@/lib/actions/gallery";
import { publicGalleryUrl } from "@/lib/data/site-content";
import { GalleryUploadForm } from "@/components/admin/gallery-upload-form";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminGaleriaPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("gallery_items")
    .select("id, storage_path, caption")
    .order("display_order");

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Galería
      </h1>
      <p className="mt-1 text-ink-900/60">Fotos visibles en el sitio público.</p>

      <div className="mt-8">
        <GalleryUploadForm />
      </div>

      {(!items || items.length === 0) ? (
        <div className="mt-8 rounded-xl border border-dashed border-ink-900/15 p-10 text-center text-ink-900/50">
          No hay fotos publicadas todavía.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-square overflow-hidden rounded-lg bg-ink-900/5">
              <Image
                src={publicGalleryUrl(item.storage_path)}
                alt={item.caption ?? "Nexus Football"}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <DeleteButton
                  action={deleteGalleryItemAction.bind(null, item.id, item.storage_path)}
                  confirmMessage="¿Eliminar esta foto de la galería?"
                  label="Eliminar"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
