import { getSchedules } from "@/lib/data/site-content";

export const metadata = { title: "Horarios — Nexus Football" };

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

function formatTime(t: string) {
  return t.slice(0, 5);
}

export default async function HorariosPage() {
  const schedules = await getSchedules();
  const sorted = [...schedules].sort(
    (a, b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Horarios</p>
      <h1 className="font-display mt-2 text-4xl font-bold uppercase tracking-tight text-ink-900">
        Días y horarios de entrenamiento
      </h1>
      <p className="mt-3 max-w-2xl text-ink-900/60">
        Los horarios pueden variar según temporada. Confirma siempre con tu
        entrenador o a través del formulario de contacto.
      </p>

      <div className="mt-10 rounded-xl border border-ink-900/10 p-6">
        {sorted.length === 0 ? (
          <p className="text-sm text-ink-900/50">
            Horario por confirmar — escríbenos para más detalles.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sorted.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-900/5 py-3 first:border-t-0 first:pt-0"
              >
                <span className="font-display text-lg font-bold uppercase text-ink-900">
                  {DAY_LABELS[s.day_of_week] ?? s.day_of_week}
                </span>
                <span className="text-ink-900/70">
                  {formatTime(s.start_time)} – {formatTime(s.end_time)}
                </span>
                <span className="text-ink-900/50">{s.location}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
