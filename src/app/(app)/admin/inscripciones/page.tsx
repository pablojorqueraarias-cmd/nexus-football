import { createClient } from "@/lib/supabase/server";
import { approveInscriptionAction, rejectInscriptionAction } from "@/lib/actions/inscriptions";

const STATUS_STYLES: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  aprobada: "bg-green-100 text-green-700",
  rechazada: "bg-zinc-200 text-zinc-600",
};

export default async function AdminInscripcionesPage() {
  const supabase = await createClient();
  const { data: inscriptions } = await supabase
    .from("inscriptions")
    .select("*, category:categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Inscripciones
      </h1>
      <p className="mt-1 text-ink-900/60">
        Revisa las solicitudes recibidas desde el sitio público.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {(!inscriptions || inscriptions.length === 0) && (
          <div className="rounded-xl border border-dashed border-ink-900/15 p-10 text-center text-ink-900/50">
            No hay inscripciones todavía.
          </div>
        )}

        {inscriptions?.map((ins) => {
          const category = ins.category as { name: string } | null;
          return (
            <div key={ins.id} className="rounded-xl border border-ink-900/10 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-ink-900">
                    {ins.child_full_name}
                  </h2>
                  <p className="text-sm text-ink-900/60">
                    {category?.name ?? "Sin categoría"} {ins.birth_date ? `· nacido/a ${ins.birth_date}` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${STATUS_STYLES[ins.status]}`}>
                  {ins.status}
                </span>
              </div>

              <div className="mt-4 grid gap-1 text-sm text-ink-900/70 sm:grid-cols-2">
                <p>Apoderado: <span className="font-semibold text-ink-900">{ins.parent_full_name}</span></p>
                <p>Correo: {ins.parent_email}</p>
                {ins.parent_phone && <p>Teléfono: {ins.parent_phone}</p>}
              </div>

              {ins.message && (
                <p className="mt-3 rounded-md bg-zinc-50 p-3 text-sm text-ink-900/70">{ins.message}</p>
              )}

              {ins.status === "pendiente" && (
                <div className="mt-4 flex gap-3">
                  <form action={approveInscriptionAction.bind(null, ins.id)}>
                    <button
                      type="submit"
                      className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
                    >
                      Aprobar
                    </button>
                  </form>
                  <form action={rejectInscriptionAction.bind(null, ins.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-ink-900/15 px-4 py-2 text-sm font-bold uppercase tracking-wide text-ink-900 hover:bg-zinc-50"
                    >
                      Rechazar
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
