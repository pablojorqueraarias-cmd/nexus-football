"use client";

import { useTransition } from "react";
import { setPaymentStatusAction } from "@/lib/actions/payments";
import type { PaymentStatus } from "@/types/database.types";

export function PaymentStatusSelect({ paymentId, status }: { paymentId: string; status: PaymentStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value as PaymentStatus;
        startTransition(() => {
          setPaymentStatusAction(paymentId, value);
        });
      }}
      className="rounded-md border border-ink-900/15 px-2 py-1 text-xs font-semibold uppercase"
    >
      <option value="pendiente">Pendiente</option>
      <option value="pagado">Pagado</option>
    </select>
  );
}
