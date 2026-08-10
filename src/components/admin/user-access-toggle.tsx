"use client";

import { useTransition } from "react";
import { setUserAccessAction } from "@/lib/actions/users";

export function UserAccessToggle({
  userId,
  isActive,
  disabled,
}: {
  userId: string;
  isActive: boolean;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={disabled || isPending}
      onClick={() => startTransition(() => setUserAccessAction(userId, !isActive))}
      className={`rounded-md px-3 py-1 text-xs font-medium disabled:opacity-50 ${
        isActive
          ? "border border-ink-900/15 text-ink-900/70 hover:bg-zinc-100"
          : "bg-red-100 text-red-700 hover:bg-red-200"
      }`}
    >
      {isActive ? "Activo · Quitar acceso" : "Bloqueado · Restaurar acceso"}
    </button>
  );
}
