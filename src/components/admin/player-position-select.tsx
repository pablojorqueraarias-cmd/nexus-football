"use client";

import { useTransition } from "react";
import { setPlayerPositionAction } from "@/lib/actions/players";

export function PlayerPositionSelect({
  playerId,
  positionId,
  positions,
}: {
  playerId: string;
  positionId: string | null;
  positions: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={positionId ?? ""}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value || null;
        startTransition(() => {
          setPlayerPositionAction(playerId, value);
        });
      }}
      className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
    >
      <option value="">Sin posición</option>
      {positions.map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  );
}
