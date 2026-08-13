"use client";

export function PrintButton() {
  return (
    <div className="print:hidden flex flex-col items-start gap-1 sm:items-end">
      <button
        onClick={() => window.print()}
        className="rounded-md border border-ink-900/15 px-3 py-1.5 text-sm font-semibold text-ink-900 hover:bg-zinc-100"
      >
        Imprimir / Guardar como PDF
      </button>
      <p className="max-w-[220px] text-right text-xs text-ink-900/40">
        En el cuadro que se abre, cambia <strong>&quot;Destino&quot;</strong> a{" "}
        <strong>&quot;Guardar como PDF&quot;</strong> para descargarlo en vez de imprimirlo.
      </p>
    </div>
  );
}
