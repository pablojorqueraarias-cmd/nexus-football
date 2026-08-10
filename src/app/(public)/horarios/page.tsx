import { getCategories, getSchedules } from "@/lib/data/site-content";

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

function formatTime(t: string) {
  return t.slice(0, 5);
}

export default async function HorariosPage() {
  const [categories, schedules] = await Promise.all([getCategories(), getSchedules()]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-500">Horarios</p>
      <h1 className="font-display mt-2 text-4xl font-bold uppercase tracking-tight text-ink-900">
        Días y horarios de entrenamiento
      </h1>
      <p className="mt-3 max-w-2xl text-ink-900/60">
        Los horarios pueden variar según temporada. Confirma siempre con tu
        entrenador o a través del formulario de contacto.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {categories.map((cat) => {
          const catSchedules = schedules.filter((s) => s.category_id === cat.id);
          return (
            <div key={cat.id} className="rounded-xl border border-ink-900/10 p-6">
              <h2 className="font-display text-xl font-bold uppercase text-ink-900">
                {cat.name}
                <span className="ml-2 text-sm font-normal normal-case text-ink-900/50">
                  {cat.age_range}
                </span>
              </h2>

              {catSchedules.length === 0 ? (
                <p className="mt-3 text-sm text-ink-900/50">
                  Horario por confirmar — escríbenos para más detalles.
                </p>
              ) : (
                <ul className="mt-4 flex flex-col gap-2">
                  {catSchedules.map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-900/5 py-2 text-sm first:border-t-0 first:pt-0"
                    >
                      <span className="font-semibold text-ink-900">
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
          );
        })}
      </div>
    </div>
  );
}
