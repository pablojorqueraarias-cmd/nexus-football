"use client";

import { useActionState } from "react";
import { submitInscriptionAction, type InscriptionFormState } from "@/lib/actions/inscriptions";

const initialState: InscriptionFormState = { success: false };

export function InscriptionForm({
  categories,
}: {
  categories: { id: string; name: string; age_range: string | null }[];
}) {
  const [state, action, pending] = useActionState(submitInscriptionAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-8 text-center">
        <p className="font-display text-xl font-bold text-brand-700">
          ¡Inscripción recibida!
        </p>
        <p className="mt-2 text-sm text-ink-900/70">
          Nuestro equipo revisará los datos y te contactará por correo o teléfono
          para confirmar el cupo.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="font-display text-sm font-bold uppercase tracking-widest text-brand-600">
          Datos del niño/a
        </legend>

        <div className="flex flex-col gap-1">
          <label htmlFor="child_full_name" className="text-sm font-semibold text-ink-900">
            Nombre completo
          </label>
          <input
            id="child_full_name"
            name="child_full_name"
            required
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="birth_date" className="text-sm font-semibold text-ink-900">
              Fecha de nacimiento
            </label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="desired_category_id" className="text-sm font-semibold text-ink-900">
              Categoría de interés
            </label>
            <select
              id="desired_category_id"
              name="desired_category_id"
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.age_range ? `(${c.age_range})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-display text-sm font-bold uppercase tracking-widest text-brand-600">
          Datos del apoderado
        </legend>

        <div className="flex flex-col gap-1">
          <label htmlFor="parent_full_name" className="text-sm font-semibold text-ink-900">
            Nombre completo
          </label>
          <input
            id="parent_full_name"
            name="parent_full_name"
            required
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="parent_email" className="text-sm font-semibold text-ink-900">
              Correo
            </label>
            <input
              id="parent_email"
              name="parent_email"
              type="email"
              required
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="parent_phone" className="text-sm font-semibold text-ink-900">
              Teléfono
            </label>
            <input
              id="parent_phone"
              name="parent_phone"
              className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="message" className="text-sm font-semibold text-ink-900">
            Comentarios (opcional)
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </fieldset>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-500 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Enviar inscripción"}
      </button>
    </form>
  );
}
