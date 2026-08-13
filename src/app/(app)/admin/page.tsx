import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function count(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "inscriptions" | "players" | "payments" | "contact_messages",
  match?: Record<string, unknown>
) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (match) query = query.match(match);
  const { count } = await query;
  return count ?? 0;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [pendingInscriptions, activePlayers, pendingPayments, unreadMessages] = await Promise.all([
    count(supabase, "inscriptions", { status: "pendiente" }),
    count(supabase, "players", { status: "activo" }),
    count(supabase, "payments", { status: "pendiente" }),
    count(supabase, "contact_messages", { is_read: false }),
  ]);

  const cards = [
    { label: "Inscripciones pendientes", value: pendingInscriptions, href: "/admin/inscripciones" },
    { label: "Alumnos activos", value: activePlayers, href: "/admin/jugadores" },
    { label: "Pagos pendientes", value: pendingPayments, href: "/admin/pagos" },
    { label: "Mensajes sin leer", value: unreadMessages, href: "/admin/mensajes" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Panel de administración
      </h1>
      <p className="mt-1 text-ink-900/60">Resumen general de Nexus Football.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-ink-900/10 p-6 transition-shadow hover:shadow-lg"
          >
            <p className="font-display text-4xl font-bold text-brand-500">{card.value}</p>
            <p className="mt-1 text-sm font-semibold text-ink-900/70">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
