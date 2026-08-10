"use client";

import { useActionState } from "react";
import { submitContactAction, type ContactFormState } from "@/lib/actions/contact";

const initialState: ContactFormState = { success: false };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-6 text-center">
        <p className="font-display text-lg font-bold text-brand-700">¡Gracias por escribirnos!</p>
        <p className="mt-1 text-sm text-ink-900/70">
          Recibimos tu mensaje y te responderemos a la brevedad.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-semibold text-ink-900">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          required
          className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-semibold text-ink-900">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm font-semibold text-ink-900">
            Teléfono (opcional)
          </label>
          <input
            id="phone"
            name="phone"
            className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm font-semibold text-ink-900">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}
