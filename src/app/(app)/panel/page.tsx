import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const DAY_LABELS: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

const DAY_ORDER = Object.keys(DAY_LABELS);

export default async function PanelPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: players }, { data: schedules }] = await Promise.all([
    supabase
      .from("players")
      .select("id, full_name, status, category:categories(id, name, age_range)")
      .eq("parent_id", user!.id),
    supabase
      .from("schedules")
      .select("day_of_week, start_time, end_time, location"),
  ]);

  const sortedSchedules = (schedules ?? []).sort(
    (a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Resumen
      </h1>
      <p className="mt-1 text-ink-900/60">Estado de tus hijos/as en Nexus Football.</p>

      {!players || players.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-ink-900/15 p-10 text-center text-ink-900/50">
          Aún no tienes jugadores asociados a tu cuenta. Si crees que esto es un
          error, escríbenos desde{" "}
          <Link href="/contacto" className="text-brand-500 underline">
            contacto
          </Link>
          .
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {players.map((player) => {
            const category = player.category as { id: string; name: string; age_range: string | null } | null;

            return (
              <div key={player.id} className="rounded-xl border border-ink-900/10 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-ink-900">{player.full_name}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                      player.status === "activo"
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {player.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-900/60">
                  Categoría: <span className="font-semibold text-ink-900">{category?.name ?? "Sin asignar"}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}

      {sortedSchedules.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold uppercase text-ink-900">
            Horario de entrenamiento
          </h2>
          <ul className="mt-3 flex flex-col gap-1 rounded-xl border border-ink-900/10 p-4 text-sm text-ink-900/70">
            {sortedSchedules.map((s, i) => (
              <li key={i}>
                {DAY_LABELS[s.day_of_week] ?? s.day_of_week} · {s.start_time.slice(0, 5)}–
                {s.end_time.slice(0, 5)} · {s.location}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
