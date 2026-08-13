"use client";

import { useTransition } from "react";
import { setPlayerScholarshipAction } from "@/lib/actions/players";

export function PlayerScholarshipToggle({
  playerId,
  isScholarship,
}: {
  playerId: string;
  isScholarship: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-ink-900/70">
      <input
        type="checkbox"
        defaultChecked={isScholarship}
        disabled={pending}
        onChange={(e) => {
          const value = e.target.checked;
          startTransition(() => {
            setPlayerScholarshipAction(playerId, value);
          });
        }}
      />
      Becado
    </label>
  );
}
