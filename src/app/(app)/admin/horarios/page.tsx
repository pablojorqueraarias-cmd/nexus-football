import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createScheduleAction, deleteScheduleAction } from "@/lib/actions/schedules";
import { DeleteButton } from "@/components/admin/delete-button";

const DAY_LABELS: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

export default async function AdminHorariosPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: schedules }] = await Promise.all([
    supabase.from("categories").select("id, name").order("display_order"),
    supabase.from("schedules").select("*, category:categories(name)").order("display_order"),
  ]);

  async function action(formData: FormData) {
    "use server";
    await createScheduleAction(formData);
    redirect("/admin/horarios");
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Horarios
      </h1>
      <p className="mt-1 text-ink-900/60">Horarios de entrenamiento visibles en el sitio público.</p>

      <form action={action} className="mt-8 flex flex-wrap items-end gap-3 rounded-xl border border-ink-900/10 p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="category_id" className="text-xs font-semibold uppercase text-ink-900/60">
            Categoría
          </label>
          <select id="category_id" name="category_id" required className="rounded-md border border-ink-900/15 px-3 py-2 text-sm">
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="day_of_week" className="text-xs font-semibold uppercase text-ink-900/60">
            Día
          </label>
          <select id="day_of_week" name="day_of_week" required className="rounded-md border border-ink-900/15 px-3 py-2 text-sm">
            {Object.entries(DAY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="start_time" className="text-xs font-semibold uppercase text-ink-900/60">
            Inicio
          </label>
          <input id="start_time" name="start_time" type="time" required className="rounded-md border border-ink-900/15 px-3 py-2 text-sm" />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="end_time" className="text-xs font-semibold uppercase text-ink-900/60">
            Término
          </label>
          <input id="end_time" name="end_time" type="time" required className="rounded-md border border-ink-900/15 px-3 py-2 text-sm" />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="location" className="text-xs font-semibold uppercase text-ink-900/60">
            Sede
          </label>
          <input id="location" name="location" required className="rounded-md border border-ink-900/15 px-3 py-2 text-sm" />
        </div>

        <button
          type="submit"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
        >
          Agregar
        </button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-ink-900/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Día</th>
              <th className="px-4 py-3">Horario</th>
              <th className="px-4 py-3">Sede</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(schedules ?? []).map((s) => {
              const category = s.category as { name: string } | null;
              return (
                <tr key={s.id} className="border-t border-ink-900/5">
                  <td className="px-4 py-3 font-semibold text-ink-900">{category?.name}</td>
                  <td className="px-4 py-3">{DAY_LABELS[s.day_of_week] ?? s.day_of_week}</td>
                  <td className="px-4 py-3">{s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}</td>
                  <td className="px-4 py-3">{s.location}</td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton
                      action={deleteScheduleAction.bind(null, s.id)}
                      confirmMessage="¿Eliminar este horario?"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
