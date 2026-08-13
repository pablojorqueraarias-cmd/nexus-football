import type { SiteContent } from "@/lib/data/site-content";

export function BankTransferCard({ content }: { content: SiteContent }) {
  if (!content.bank_account_number) return null;

  const rows: [string, string | null][] = [
    ["Banco", content.bank_name],
    ["Tipo de cuenta", content.bank_account_type],
    ["Número de cuenta", content.bank_account_number],
    ["Titular", content.bank_account_holder],
    ["RUT", content.bank_account_rut],
    ["Enviar comprobante a", content.bank_transfer_email],
  ];

  return (
    <div className="rounded-xl border border-ink-900/10 p-4">
      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-900/70">
        Datos para transferencia
      </h2>
      <dl className="mt-3 flex flex-col gap-1 text-sm">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-ink-900/50">{label}</dt>
              <dd className="font-semibold text-ink-900">{value}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}
