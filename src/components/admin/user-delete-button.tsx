"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteUserAction } from "@/lib/actions/users";

export function UserDeleteButton({
  userId,
  userName,
  disabled,
}: {
  userId: string;
  userName: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={disabled || isPending}
      onClick={() => {
        if (
          !confirm(
            `¿Eliminar a ${userName}? Esta acción no se puede deshacer: pierde acceso y su cuenta se borra por completo.`
          )
        ) {
          return;
        }
        startTransition(async () => {
          await deleteUserAction(userId);
          router.refresh();
        });
      }}
      className="rounded-md border border-ink-900/15 px-3 py-1 text-xs font-medium text-ink-900/50 hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
    >
      Eliminar
    </button>
  );
}
