"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileFormState } from "@/lib/actions/profile";

const initialState: ProfileFormState = { success: false };

export function ProfileForm({
  fullName,
  phone,
  email,
}: {
  fullName: string;
  phone: string | null;
  email: string;
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-ink-900">Correo</label>
        <input
          value={email}
          disabled
          className="rounded-md border border-ink-900/10 bg-zinc-50 px-3 py-2 text-sm text-ink-900/50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="full_name" className="text-sm font-semibold text-ink-900">
          Nombre completo
        </label>
        <input
          id="full_name"
          name="full_name"
          defaultValue={fullName}
          required
          className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-semibold text-ink-900">
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={phone ?? ""}
          className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Perfil actualizado.</p>}

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
