import Image from "next/image";
import { getGalleryItems, publicGalleryUrl } from "@/lib/data/site-content";

export const metadata = { title: "Galería — Nexus Football" };

export default async function GaleriaPage() {
  const items = await getGalleryItems();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Galería</p>
      <h1 className="font-display mt-2 text-4xl font-bold uppercase tracking-tight text-ink-900">
        Momentos Nexus Football
      </h1>
      <p className="mt-3 max-w-2xl text-ink-900/60">
        Entrenamientos, partidos y torneos de nuestras categorías.
      </p>

      {items.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-ink-900/15 p-16 text-center text-ink-900/40">
          Aún no hay fotos publicadas. Vuelve pronto.
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg bg-ink-900/5">
              <Image
                src={publicGalleryUrl(item.storage_path)}
                alt={item.caption ?? "Nexus Football"}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
