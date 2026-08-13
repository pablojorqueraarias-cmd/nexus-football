import Image from "next/image";
import Link from "next/link";
import { getCategories, getGalleryItems, getSiteContent, publicGalleryUrl } from "@/lib/data/site-content";
import { VideoEmbed } from "@/components/video-embed";

export default async function HomePage() {
  const [categories, content, gallery] = await Promise.all([
    getCategories(),
    getSiteContent(),
    getGalleryItems(),
  ]);
  const featured = gallery.filter((item) => item.is_featured).slice(0, 8);

  return (
    <>
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,var(--color-brand-700)_0%,transparent_45%),radial-gradient(circle_at_85%_80%,var(--color-brand-900)_0%,transparent_50%)]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-400">
            {content.hero_eyebrow}
          </p>
          <h1 className="font-display max-w-2xl text-5xl font-bold uppercase leading-[1.05] tracking-tight sm:text-6xl">
            Nexus <span className="text-brand-500">Football</span>
          </h1>
          <p className="max-w-xl text-lg text-white/70">{content.hero_description}</p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/inscripcion"
              className="rounded-md bg-brand-500 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-600"
            >
              Inscríbete ahora
            </Link>
            <Link
              href="/programas"
              className="rounded-md border border-white/30 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-white"
            >
              Ver programas
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-center text-3xl font-bold uppercase tracking-tight text-ink-900">
          Nuestras categorías
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-ink-900/60">
          Un camino formativo pensado por edad y nivel.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col gap-3 rounded-xl border border-ink-900/10 p-6 transition-shadow hover:shadow-lg"
            >
              <span className="font-display text-xs font-bold uppercase tracking-widest text-brand-500">
                {cat.age_range}
              </span>
              <h3 className="font-display text-2xl font-bold uppercase text-ink-900">
                {cat.name}
              </h3>
              <p className="text-sm text-ink-900/60">{cat.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/programas"
            className="text-sm font-bold uppercase tracking-wide text-brand-500 hover:text-brand-600"
          >
            Conoce el detalle de cada programa →
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <h2 className="font-display text-center text-3xl font-bold uppercase tracking-tight text-ink-900">
            Momentos destacados
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {featured.map((item) => (
              <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg bg-ink-900/5">
                {item.media_type === "video" && item.video_url ? (
                  <VideoEmbed url={item.video_url} className="h-full w-full" />
                ) : (
                  <Image
                    src={publicGalleryUrl(item.storage_path!)}
                    alt={item.caption ?? "Nexus Football"}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/galeria"
              className="text-sm font-bold uppercase tracking-wide text-brand-500 hover:text-brand-600"
            >
              Ver toda la galería →
            </Link>
          </div>
        </section>
      )}

      <section className="bg-brand-500 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight">
            Pasión · Jerarquía · Actitud
          </h2>
          <p className="max-w-xl text-white/90">{content.cta_description}</p>
          <Link
            href="/inscripcion"
            className="mt-2 rounded-md bg-ink-900 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-ink-800"
          >
            Inscríbete ahora
          </Link>
        </div>
      </section>
    </>
  );
}
