"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PaymentStatus } from "@/types/database.types";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Solo el administrador puede hacer esto");
  return user.id;
}

const paymentSchema = z.object({
  player_id: z.string().uuid(),
  period: z.string().min(4, "Indica el período (ej. 2026-08)."),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0."),
  method: z.enum(["transferencia", "efectivo"]),
  status: z.enum(["pendiente", "pagado"]),
  due_date: z.string().optional(),
});

export async function createPaymentAction(formData: FormData) {
  const adminId = await assertAdmin();
  const supabase = await createClient();

  const parsed = paymentSchema.parse({
    player_id: formData.get("player_id"),
    period: formData.get("period"),
    amount: formData.get("amount"),
    method: formData.get("method") || "transferencia",
    status: formData.get("status") || "pendiente",
    due_date: (formData.get("due_date") as string) || undefined,
  });

  const { due_date, ...rest } = parsed;

  const { error } = await supabase
    .from("payments")
    .insert({ ...rest, due_date: due_date || null, registered_by: adminId });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/pagos");
}

export async function setPaymentDueDateAction(paymentId: string, dueDate: string | null) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("payments").update({ due_date: dueDate }).eq("id", paymentId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/pagos");
  revalidatePath("/panel/pagos");
}

export async function setPaymentStatusAction(paymentId: string, status: PaymentStatus) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("payments").update({ status }).eq("id", paymentId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/pagos");
}

export async function deletePaymentAction(paymentId: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("payments").delete().eq("id", paymentId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/pagos");
}
