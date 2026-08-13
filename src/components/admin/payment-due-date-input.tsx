"use client";

import { useTransition } from "react";
import { setPaymentDueDateAction } from "@/lib/actions/payments";

export function PaymentDueDateInput({ paymentId, dueDate }: { paymentId: string; dueDate: string | null }) {
  const [pending, startTransition] = useTransition();

  return (
    <input
      type="date"
      defaultValue={dueDate ?? ""}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value || null;
        startTransition(() => {
          setPaymentDueDateAction(paymentId, value);
        });
      }}
      className="rounded-md border border-ink-900/15 px-2 py-1 text-xs disabled:opacity-50"
    />
  );
}
