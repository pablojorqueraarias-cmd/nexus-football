"use client";

import { useActionState, useRef } from "react";
import { uploadDocumentAction, type DocumentFormState } from "@/lib/actions/documents";

const initialState: DocumentFormState = { success: false };

const CATEGORIES = [
  { value: "antropometrica", label: "Evaluación antropométrica" },
  { value: "carta_colegio", label: "Carta para el colegio" },
  { value: "concentracion_notas", label: "Concentración de notas" },
  { value: "otro", label: "Otro" },
];

export function DocumentUploadForm({ playerId }: { playerId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const boundUpload = uploadDocumentAction.bind(null, playerId);
  const [state, action, pending] = useActionState(async (prev: DocumentFormState, formData: FormData) => {
    const result = await boundUpload(prev, formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={action} className="flex flex-wrap items-end gap-3 rounded-xl border border-ink-900/10 p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="file" className="text-xs font-semibold uppercase text-ink-900/60">
          Archivo (PDF u otro)
        </label>
        <input id="file" name="file" type="file" accept="application/pdf,image/*" required className="text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-xs font-semibold uppercase text-ink-900/60">
          Categoría
        </label>
        <select id="category" name="category" className="rounded-md border border-ink-900/15 px-3 py-2 text-sm">
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {pending ? "Subiendo..." : "Subir documento"}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
