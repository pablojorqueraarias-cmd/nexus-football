import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPlayerAction } from "@/lib/actions/players";

export default async function NuevoJugadorPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: parents }] = await Promise.all([
    supabase.from("categories").select("id, name").order("display_order"),
    supabase.from("profiles").select("id, full_name").eq("role", "parent").order("full_name"),
  ]);

  async function action(formData: FormData) {
    "use server";
    await createPlayerAction(formData);
    redirect("/admin/jugadores");
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Nuevo alumno
      </h1>
      <p className="mt-1 text-ink-900/60">Agrega manualmente un alumno a la academia.</p>

      <form action={action} className="mt-8 flex max-w-lg flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="full_name" className="text-sm font-semibold text-ink-900">
            Nombre completo
          </label>
          <input
            id="full_name"
            name="full_name"
            required
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="birth_date" className="text-sm font-semibold text-ink-900">
              Fecha de nacimiento
            </label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="category_id" className="text-sm font-semibold text-ink-900">
              Categoría
            </label>
            <select
              id="category_id"
              name="category_id"
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Sin categoría</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="parent_id" className="text-sm font-semibold text-ink-900">
            Apoderado
          </label>
          <select
            id="parent_id"
            name="parent_id"
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Sin asignar</option>
            {(parents ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
          <p className="text-xs text-ink-900/40">
            Solo aparecen apoderados que ya tienen cuenta (creada desde
            Usuarios o al aprobar una inscripción).
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm font-semibold text-ink-900">
            Estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue="activo"
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm font-semibold text-ink-900">
            Notas (opcional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          className="mt-2 self-start rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
        >
          Crear alumno
        </button>
      </form>
    </div>
  );
}
