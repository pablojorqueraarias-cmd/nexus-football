"use client";

import { useTransition } from "react";
import { markMessageReadAction } from "@/lib/actions/contact-messages";

export function MarkReadButton({ messageId, isRead }: { messageId: string; isRead: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => markMessageReadAction(messageId, !isRead))}
      className="text-xs font-semibold uppercase tracking-wide text-brand-500 hover:text-brand-600 disabled:opacity-50"
    >
      {isRead ? "Marcar como no leído" : "Marcar como leído"}
    </button>
  );
}
