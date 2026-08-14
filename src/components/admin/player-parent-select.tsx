"use client";

import { useTransition } from "react";
import { setPlayerParentAction } from "@/lib/actions/players";

export function PlayerParentSelect({
  playerId,
  parentId,
  parents,
}: {
  playerId: string;
  parentId: string | null;
  parents: { id: string; full_name: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={parentId ?? ""}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value || null;
        startTransition(() => {
          setPlayerParentAction(playerId, value);
        });
      }}
      className="rounded-md border border-ink-900/15 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
    >
      <option value="">Sin asignar</option>
      {parents.map((p) => (
        <option key={p.id} value={p.id}>{p.full_name}</option>
      ))}
    </select>
  );
}
