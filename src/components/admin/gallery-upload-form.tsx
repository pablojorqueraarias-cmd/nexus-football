"use client";

import { useActionState, useRef } from "react";
import { uploadGalleryItemAction, type GalleryFormState } from "@/lib/actions/gallery";

const initialState: GalleryFormState = { success: false };

export function GalleryUploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (prev: GalleryFormState, formData: FormData) => {
    const result = await uploadGalleryItemAction(prev, formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={action} className="flex flex-wrap items-end gap-3 rounded-xl border border-ink-900/10 p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="file" className="text-xs font-semibold uppercase text-ink-900/60">
          Imagen
        </label>
        <input id="file" name="file" type="file" accept="image/*" required className="text-sm" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="caption" className="text-xs font-semibold uppercase text-ink-900/60">
          Descripción (opcional)
        </label>
        <input id="caption" name="caption" className="rounded-md border border-ink-900/15 px-3 py-2 text-sm" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {pending ? "Subiendo..." : "Subir foto"}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
