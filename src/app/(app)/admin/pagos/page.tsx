import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPaymentAction, deletePaymentAction } from "@/lib/actions/payments";
import { PaymentStatusSelect } from "@/components/admin/payment-status-select";
import { PaymentDueDateInput } from "@/components/admin/payment-due-date-input";
import { PlayerScholarshipToggle } from "@/components/admin/player-scholarship-toggle";
import { DeleteButton } from "@/components/admin/delete-button";

export default async function AdminPagosPage() {
  const supabase = await createClient();
  const [{ data: payments }, { data: players }] = await Promise.all([
    supabase
      .from("payments")
      .select("id, period, amount, method, status, due_date, player:players(full_name, is_scholarship)")
      .order("period", { ascending: false }),
    supabase
      .from("players")
      .select("id, full_name, is_scholarship")
      .eq("status", "activo")
      .order("full_name"),
  ]);

  async function action(formData: FormData) {
    "use server";
    await createPaymentAction(formData);
    redirect("/admin/pagos");
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Pagos
      </h1>
      <p className="mt-1 text-ink-900/60">
        Registro manual de pagos por transferencia o efectivo.
      </p>

      <div className="mt-8 rounded-xl border border-ink-900/10 p-4">
        <h2 className="font-display mb-3 text-sm font-bold uppercase tracking-wide text-ink-900/70">
          Alumnos becados
        </h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {(players ?? []).map((p) => (
            <PlayerScholarshipToggle key={p.id} playerId={p.id} isScholarship={p.is_scholarship} />
          ))}
        </div>
      </div>

      <form action={action} className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-ink-900/10 p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="player_id" className="text-xs font-semibold uppercase text-ink-900/60">
            Alumno
          </label>
          <select id="player_id" name="player_id" required className="rounded-md border border-ink-900/15 px-3 py-2 text-sm">
            <option value="">Selecciona</option>
            {(players ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="period" className="text-xs font-semibold uppercase text-ink-900/60">
            Período
          </label>
          <input id="period" name="period" placeholder="2026-08" required className="w-28 rounded-md border border-ink-900/15 px-3 py-2 text-sm" />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="amount" className="text-xs font-semibold uppercase text-ink-900/60">
            Monto
          </label>
          <input id="amount" name="amount" type="number" min="0" step="1" required className="w-28 rounded-md border border-ink-900/15 px-3 py-2 text-sm" />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="due_date" className="text-xs font-semibold uppercase text-ink-900/60">
            Fecha de pago
          </label>
          <input id="due_date" name="due_date" type="date" className="rounded-md border border-ink-900/15 px-3 py-2 text-sm" />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="method" className="text-xs font-semibold uppercase text-ink-900/60">
            Método
          </label>
          <select id="method" name="method" defaultValue="transferencia" className="rounded-md border border-ink-900/15 px-3 py-2 text-sm">
            <option value="transferencia">Transferencia</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-xs font-semibold uppercase text-ink-900/60">
            Estado
          </label>
          <select id="status" name="status" defaultValue="pendiente" className="rounded-md border border-ink-900/15 px-3 py-2 text-sm">
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600"
        >
          Registrar
        </button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-ink-900/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Alumno</th>
              <th className="px-4 py-3">Período</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Fecha de pago</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((p) => {
              const player = p.player as { full_name: string; is_scholarship: boolean } | null;
              return (
                <tr key={p.id} className="border-t border-ink-900/5">
                  <td className="px-4 py-3 font-semibold text-ink-900">
                    {player?.full_name}
                    {player?.is_scholarship && (
                      <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                        Becado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{p.period}</td>
                  <td className="px-4 py-3">${Number(p.amount).toLocaleString("es-CL")}</td>
                  <td className="px-4 py-3">
                    <PaymentDueDateInput paymentId={p.id} dueDate={p.due_date} />
                  </td>
                  <td className="px-4 py-3 capitalize">{p.method}</td>
                  <td className="px-4 py-3">
                    <PaymentStatusSelect paymentId={p.id} status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton
                      action={deletePaymentAction.bind(null, p.id)}
                      confirmMessage="¿Eliminar este registro de pago?"
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
