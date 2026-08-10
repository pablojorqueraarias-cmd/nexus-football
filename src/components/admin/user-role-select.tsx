"use client";

import { useTransition } from "react";
import { setUserRoleAction } from "@/lib/actions/users";
import type { UserRole } from "@/types/database.types";

export function UserRoleSelect({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: UserRole;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentRole}
      disabled={disabled || isPending}
      onChange={(e) => {
        const role = e.target.value as UserRole;
        startTransition(() => {
          setUserRoleAction(userId, role);
        });
      }}
      className="rounded-md border border-ink-900/15 px-2 py-1 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
    >
      <option value="parent">Apoderado</option>
      <option value="admin">Admin</option>
    </select>
  );
}
