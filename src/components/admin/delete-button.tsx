"use client";

import { useTransition } from "react";

export function DeleteButton({
  action,
  confirmMessage,
  label = "Eliminar",
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(confirmMessage)) return;
        startTransition(() => {
          action();
        });
      }}
      className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {pending ? "..." : label}
    </button>
  );
}
