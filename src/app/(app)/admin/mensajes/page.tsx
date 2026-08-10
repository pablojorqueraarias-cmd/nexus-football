import { createClient } from "@/lib/supabase/server";
import { MarkReadButton } from "@/components/admin/mark-read-button";

export default async function AdminMensajesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink-900">
        Mensajes
      </h1>
      <p className="mt-1 text-ink-900/60">Mensajes recibidos desde el formulario de contacto.</p>

      <div className="mt-8 flex flex-col gap-4">
        {(!messages || messages.length === 0) && (
          <div className="rounded-xl border border-dashed border-ink-900/15 p-10 text-center text-ink-900/50">
            No hay mensajes todavía.
          </div>
        )}

        {messages?.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl border p-6 ${m.is_read ? "border-ink-900/10" : "border-brand-300 bg-brand-50/40"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-ink-900">{m.name}</h2>
                <p className="text-sm text-ink-900/60">
                  {m.email} {m.phone ? `· ${m.phone}` : ""}
                </p>
              </div>
              <MarkReadButton messageId={m.id} isRead={m.is_read} />
            </div>
            <p className="mt-3 text-sm text-ink-900/80">{m.message}</p>
            <p className="mt-3 text-xs text-ink-900/40">
              {new Date(m.created_at).toLocaleString("es-CL")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
