import { createClient } from "@/lib/supabase/server";
import { saveAttendanceAction } from "@/lib/actions/attendance";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function AdminAsistenciaPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { fecha } = await searchParams;
  const sessionDate = fecha || todayISO();

  const supabase = await createClient();

  const [{ data: players }, { data: existing }] = await Promise.all([
    supabase
      .from("players")
      .select("id, full_name, category:categories(name)")
      .eq("status", "activo")
      .order("full_name"),
    supabase
      .from("attendance")
      .select("player_id, present")
      .eq("session_date", sessionDate),
  ]);

  const presentByPlayer = new Map((existing ?? []).map((a) => [a.player_id, a.present]));
  const playerIds = (players ?? []).map((p) => p.id);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Asistencia
      </h1>
      <p className="mt-1 text-ink-900/60">Marca la asistencia del día para todos los alumnos activos.</p>

      <form method="get" className="mt-6 flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="fecha" className="text-xs font-semibold uppercase text-ink-900/60">
            Fecha
          </label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            defaultValue={sessionDate}
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-ink-900/15 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-zinc-100"
        >
          Ver fecha
        </button>
      </form>

      <form action={saveAttendanceAction} className="mt-6">
        <input type="hidden" name="session_date" value={sessionDate} />
        <input type="hidden" name="player_ids" value={JSON.stringify(playerIds)} />

        <div className="overflow-x-auto rounded-xl border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-ink-900/50">
              <tr>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Presente</th>
              </tr>
            </thead>
            <tbody>
              {(players ?? []).map((p) => {
                const category = p.category as { name: string } | null;
                return (
                  <tr key={p.id} className="border-t border-ink-900/5">
                    <td className="px-4 py-3 font-semibold text-ink-900">{p.full_name}</td>
                    <td className="px-4 py-3">{category?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        name={`present_${p.id}`}
                        defaultChecked={presentByPlayer.get(p.id) ?? false}
                        className="h-5 w-5 accent-[var(--color-brand-500)]"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(!players || players.length === 0) && (
          <p className="mt-4 text-sm text-ink-900/50">No hay alumnos activos.</p>
        )}

        <button
          type="submit"
          className="mt-6 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
        >
          Guardar asistencia
        </button>
      </form>
    </div>
  );
}
