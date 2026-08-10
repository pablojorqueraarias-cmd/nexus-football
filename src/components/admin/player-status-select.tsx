"use client";

import { useTransition } from "react";
import { setPlayerStatusAction } from "@/lib/actions/players";
import type { PlayerStatus } from "@/types/database.types";

export function PlayerStatusSelect({ playerId, status }: { playerId: string; status: PlayerStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value as PlayerStatus;
        startTransition(() => {
          setPlayerStatusAction(playerId, value);
        });
      }}
      className="rounded-md border border-ink-900/15 px-2 py-1 text-xs font-semibold uppercase"
    >
      <option value="activo">Activo</option>
      <option value="inactivo">Inactivo</option>
    </select>
  );
}
