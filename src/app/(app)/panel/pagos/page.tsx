import { createClient } from "@/lib/supabase/server";
import { getSiteContent } from "@/lib/data/site-content";
import { BankTransferCard } from "@/components/bank-transfer-card";

const STATUS_STYLES: Record<string, string> = {
  pagado: "bg-green-100 text-green-700",
  pendiente: "bg-amber-100 text-amber-700",
};

const METHOD_LABELS: Record<string, string> = {
  transferencia: "Transferencia",
  efectivo: "Efectivo",
};

export default async function PanelPagosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: players } = await supabase
    .from("players")
    .select("id")
    .eq("parent_id", user!.id);

  const playerIds = (players ?? []).map((p) => p.id);

  const [{ data: payments }, content] = await Promise.all([
    playerIds.length > 0
      ? supabase
          .from("payments")
          .select("id, period, amount, method, status, due_date, player:players(full_name)")
          .in("player_id", playerIds)
          .order("period", { ascending: false })
      : Promise.resolve({ data: [] }),
    getSiteContent(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
          Pagos
        </h1>
        <p className="mt-1 text-ink-900/60">
          Historial de pagos registrados por la academia. Los pagos se
          coordinan por transferencia o efectivo directamente con Nexus Football.
        </p>
      </div>

      <BankTransferCard content={content} />

      {!payments || payments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-900/15 p-10 text-center text-ink-900/50">
          Aún no hay pagos registrados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink-900/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-ink-900/50">
              <tr>
                <th className="px-4 py-3">Jugador/a</th>
                <th className="px-4 py-3">Período</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Fecha de pago</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const player = p.player as { full_name: string } | null;
                return (
                  <tr key={p.id} className="border-t border-ink-900/5">
                    <td className="px-4 py-3">{player?.full_name}</td>
                    <td className="px-4 py-3">{p.period}</td>
                    <td className="px-4 py-3">${Number(p.amount).toLocaleString("es-CL")}</td>
                    <td className="px-4 py-3">
                      {p.due_date ? new Date(p.due_date).toLocaleDateString("es-CL") : "—"}
                    </td>
                    <td className="px-4 py-3">{METHOD_LABELS[p.method] ?? p.method}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${STATUS_STYLES[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
