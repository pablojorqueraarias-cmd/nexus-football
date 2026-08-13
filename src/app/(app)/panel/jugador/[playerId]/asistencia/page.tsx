import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function JugadorAsistenciaPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase.from("players").select("id, full_name").eq("id", playerId).single();
  if (!player) notFound();

  const { data: attendance } = await supabase
    .from("attendance")
    .select("session_date, present, notes")
    .eq("player_id", playerId)
    .order("session_date", { ascending: false });

  const total = attendance?.length ?? 0;
  const present = attendance?.filter((a) => a.present).length ?? 0;

  return (
    <div>
      <Link href={`/panel/jugador/${playerId}`} className="text-xs font-semibold uppercase tracking-wide text-ink-900/40 hover:text-brand-500">
        ← {player.full_name}
      </Link>
      <h1 className="font-display mt-1 text-3xl font-bold uppercase tracking-tight text-ink-900">
        Asistencia
      </h1>
      <p className="mt-1 text-ink-900/60">
        {total > 0 ? `${present}/${total} sesiones (${Math.round((present / total) * 100)}%)` : "Sin registros todavía."}
      </p>

      {attendance && attendance.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-ink-900/50">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a, i) => (
                <tr key={i} className="border-t border-ink-900/5">
                  <td className="px-4 py-3">{new Date(a.session_date).toLocaleDateString("es-CL")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${a.present ? "bg-green-100 text-green-700" : "bg-zinc-200 text-zinc-600"}`}>
                      {a.present ? "Presente" : "Ausente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
