"use client";

import { useActionState } from "react";
import { updateSiteContentAction, type SiteContentFormState } from "@/lib/actions/site-content";
import type { SiteContent } from "@/lib/data/site-content";

const initialState: SiteContentFormState = { success: false };

export function SiteContentForm({ content }: { content: SiteContent }) {
  const [state, action, pending] = useActionState(updateSiteContentAction, initialState);

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="hero_eyebrow" className="text-sm font-semibold text-ink-900">
          Texto pequeño sobre el título (inicio)
        </label>
        <input
          id="hero_eyebrow"
          name="hero_eyebrow"
          defaultValue={content.hero_eyebrow}
          required
          className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="hero_description" className="text-sm font-semibold text-ink-900">
          Descripción principal (inicio)
        </label>
        <textarea
          id="hero_description"
          name="hero_description"
          defaultValue={content.hero_description}
          required
          rows={3}
          className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cta_description" className="text-sm font-semibold text-ink-900">
          Texto de la sección &quot;Inscríbete ahora&quot; (inicio)
        </label>
        <textarea
          id="cta_description"
          name="cta_description"
          defaultValue={content.cta_description}
          required
          rows={3}
          className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="footer_description" className="text-sm font-semibold text-ink-900">
          Descripción en el pie de página
        </label>
        <textarea
          id="footer_description"
          name="footer_description"
          defaultValue={content.footer_description}
          required
          rows={2}
          className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="location" className="text-sm font-semibold text-ink-900">
          Ubicación (pie de página)
        </label>
        <input
          id="location"
          name="location"
          defaultValue={content.location}
          required
          className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Guardado.</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
