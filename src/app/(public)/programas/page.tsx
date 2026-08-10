import Link from "next/link";
import { getCategories } from "@/lib/data/site-content";

export const metadata = { title: "Programas — Nexus Football" };

export default async function ProgramasPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">
        Programas
      </p>
      <h1 className="font-display mt-2 text-4xl font-bold uppercase tracking-tight text-ink-900">
        Un camino formativo por etapas
      </h1>
      <p className="mt-3 max-w-2xl text-ink-900/60">
        Cada categoría tiene objetivos y metodología propios, pensados para el
        momento de desarrollo físico y futbolístico de cada jugador.
      </p>

      <div className="mt-12 flex flex-col gap-6">
        {categories.map((cat, i) => (
          <div
            key={cat.id}
            className="flex flex-col gap-3 rounded-xl border border-ink-900/10 p-8 sm:flex-row sm:items-start sm:gap-8"
          >
            <span className="font-display text-5xl font-bold text-brand-500/30">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <span className="font-display text-xs font-bold uppercase tracking-widest text-brand-500">
                {cat.age_range}
              </span>
              <h2 className="font-display mt-1 text-3xl font-bold uppercase text-ink-900">
                {cat.name}
              </h2>
              <p className="mt-2 max-w-2xl text-ink-900/60">{cat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-ink-900 p-8 text-center text-white">
        <h2 className="font-display text-2xl font-bold uppercase">
          ¿Listo para unirte?
        </h2>
        <Link
          href="/inscripcion"
          className="mt-4 inline-block rounded-md bg-brand-500 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-600"
        >
          Inscríbete ahora
        </Link>
      </div>
    </div>
  );
}
