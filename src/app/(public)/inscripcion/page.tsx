import { InscriptionForm } from "@/components/inscription-form";
import { getCategories } from "@/lib/data/site-content";

export const metadata = { title: "Inscripción — Nexus Football" };

export default async function InscripcionPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Inscripción</p>
      <h1 className="font-display mt-2 text-4xl font-bold uppercase tracking-tight text-ink-900">
        Únete a Nexus Football
      </h1>
      <p className="mt-3 text-ink-900/60">
        Completa los datos del niño o niña y de su apoderado. Revisaremos la
        inscripción y te contactaremos para confirmar el cupo y coordinar el pago.
      </p>

      <div className="mt-10">
        <InscriptionForm categories={categories} />
      </div>
    </div>
  );
}
